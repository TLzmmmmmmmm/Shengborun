export interface ChatAnswer {
  answer: string;
}

export type ChatTransport = (message: string) => Promise<ChatAnswer>;

export const MOCK_FAILURE_INPUT = '__mock_error__';
export const MOCK_RESPONSE_DELAY_MS = 700;

/** Development-only local transport. Replace with /api/chat in a later phase. */
export const requestMockChatAnswer = async (
  message: string,
  delayMs = MOCK_RESPONSE_DELAY_MS,
): Promise<ChatAnswer> => {
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

  if (message === MOCK_FAILURE_INPUT) {
    throw new Error('Development mock failure');
  }

  return {
    answer: `前端开发演示回复：已收到“${message}”。`,
  };
};

export async function* streamChatAnswer(message: string): AsyncGenerator<string> {
  const response = await fetch('http://127.0.0.1:8000/api/chat-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Streaming response body is unavailable');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      const text = decoder.decode(value, {
        stream: true,
      });

      if (text) {
        yield text;
      }
    }

    const remainingText = decoder.decode();

    if (remainingText) {
      yield remainingText;
    }
  } finally {
    reader.releaseLock();
  }
}
