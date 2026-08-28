export class ChatServiceError extends Error {
  code: string;
  status: number | null;
  requestId: string | null;

  constructor(
    message: string,
    {
      code,
      status = null,
      requestId = null,
    }: {
      code: string;
      status?: number | null;
      requestId?: string | null;
    },
  ) {
    super(message);

    this.name = 'ChatServiceError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

interface ChatErrorResponse {
  error?: {
    code?: string;
    message?: string;
    request_id?: string;
  };
}

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatStreamEvent =
  | {
      type: 'delta';
      content: string;
    }
  | {
      type: 'done';
    }
  | {
      type: 'error';
      code: string;
      message: string;
      request_id?: string;
    };

const CHAT_API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api/chat-stream'
  : '/api/chat-stream';

export async function* streamChatAnswer(messages: readonly ChatMessage[]): AsyncGenerator<string> {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
    }),
  });

  if (!response.ok) {
    let errorBody: ChatErrorResponse | null = null;

    try {
      errorBody = (await response.json()) as ChatErrorResponse;
    } catch {
      // Response body may not be valid JSON.
    }

    throw new ChatServiceError(
      errorBody?.error?.message ??
        '当前 AI 客服暂时无法响应，请稍后再试。',
      {
        code: errorBody?.error?.code ?? 'http_error',
        status: response.status,
        requestId: errorBody?.error?.request_id ?? null,
      },
    );
  }

  if (!response.body) {
    throw new ChatServiceError(
      '当前 AI 客服暂时无法响应，请稍后再试。',
      {
        code: 'stream_unavailable',
        status: response.status,
      },
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        throw new ChatServiceError(
          'AI 响应意外中断，请重新尝试。',
          {
            code: 'stream_interrupted',
          },
        );
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      while (true) {
        const newlineIndex = buffer.indexOf('\n');

        if (newlineIndex === -1) {
          break;
        }

        const line = buffer
          .slice(0, newlineIndex)
          .trim();

        buffer = buffer.slice(newlineIndex + 1);

        if (!line) {
          continue;
        }

        const event = JSON.parse(line) as ChatStreamEvent;

        if (event.type === 'delta') {
          yield event.content;
        } else if (event.type === 'error') {
          throw new ChatServiceError(
            event.message,
            {
              code: event.code,
              requestId: event.request_id ?? null,
            },
          );
        } else if (event.type === 'done') {
          return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
