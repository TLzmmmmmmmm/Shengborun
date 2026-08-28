import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  streamChatAnswer,
} from '../../src/components/chat/chat-transport';

async function collectStream(
  stream: AsyncGenerator<string>,
): Promise<string[]> {
  const chunks: string[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return chunks;
}

describe('chat transport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('streams delta events until done', async () => {
    const responseBody = [
      JSON.stringify({
        type: 'delta',
        content: '你',
      }),
      JSON.stringify({
        type: 'delta',
        content: '好',
      }),
      JSON.stringify({
        type: 'done',
      }),
      '',
    ].join('\n');

    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(responseBody, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-ndjson',
        },
      }),
    );

    vi.stubGlobal('fetch', fetchSpy);

    const result = await collectStream(
      streamChatAnswer([
        {
          role: 'user',
          content: '你好',
        },
      ]),
    );

    expect(result).toEqual([
      '你',
      '好',
    ]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [, request] = fetchSpy.mock.calls[0];

    expect(request).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(JSON.parse(request.body)).toEqual({
      messages: [
        {
          role: 'user',
          content: '你好',
        },
      ],
    });
  });

  it('throws the backend error message for non-2xx responses', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'rate_limit',
            message: '请求过于频繁，请稍后再试。',
            request_id: 'request-123',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    vi.stubGlobal('fetch', fetchSpy);

    await expect(
      collectStream(
        streamChatAnswer([
          {
            role: 'user',
            content: '你好',
          },
        ]),
      ),
    ).rejects.toMatchObject({
      name: 'ChatServiceError',
      code: 'rate_limit',
      status: 429,
      requestId: 'request-123',
      message: '请求过于频繁，请稍后再试。',
    });
  });

  it('rejects a stream that ends without a done event', async () => {
    const responseBody = [
      JSON.stringify({
        type: 'delta',
        content: '部分回答',
      }),
      '',
    ].join('\n');

    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(responseBody, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-ndjson',
        },
      }),
    );

    vi.stubGlobal('fetch', fetchSpy);

    await expect(
      collectStream(
        streamChatAnswer([
          {
            role: 'user',
            content: '你好',
          },
        ]),
      ),
    ).rejects.toMatchObject({
      name: 'ChatServiceError',
      code: 'stream_interrupted',
      message: 'AI 响应意外中断，请重新尝试。',
    });
  });
});