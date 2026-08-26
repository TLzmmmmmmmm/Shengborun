import { describe, expect, it, vi } from 'vitest';
import {
  MOCK_FAILURE_INPUT,
  requestMockChatAnswer,
} from '../../src/components/chat/chat-transport';

describe('development chat transport', () => {
  it('returns the future API response shape without calling the network', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(requestMockChatAnswer('产品咨询', 0)).resolves.toEqual({
      answer: '前端开发演示回复：已收到“产品咨询”。',
    });
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('exposes a controlled development-only failure', async () => {
    await expect(requestMockChatAnswer(MOCK_FAILURE_INPUT, 0)).rejects.toThrow(
      'Development mock failure',
    );
  });
});
