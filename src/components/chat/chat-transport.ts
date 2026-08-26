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
