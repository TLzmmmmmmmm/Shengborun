export interface ChatAnswer {
  answer: string;
}

export type ChatTransport = (message: string) => Promise<ChatAnswer>;

export const MOCK_FAILURE_INPUT = '__mock_error__';
export const MOCK_RESPONSE_DELAY_MS = 700;


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
    };

export async function* streamChatAnswer(messages: readonly ChatMessage[]): AsyncGenerator<string> {
  const response = await fetch('http://127.0.0.1:8000/api/chat-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
    }),
  });

  if (response.status === 422) {
    throw new Error('INVALID_INPUT');
  }

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Streaming response body is unavailable');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
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
          throw new Error(event.message);
        } else if (event.type === 'done') {
          return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
