import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

beforeEach(() => {
  vi.resetModules();
  send.mockReset();
  send.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
  process.env.RESEND_API_KEY = 'test-key';
  process.env.CONTACT_TO_EMAIL = 'to@example.com';
  process.env.CONTACT_FROM_EMAIL = 'from@example.com';
});

const valid = {
  name: 'Ada',
  email: 'ada@example.com',
  message: 'A genuine enquiry, at length.',
};

async function post(body: unknown) {
  const { POST } = await import('../route');
  return POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

describe('POST /api/contact', () => {
  it('sends a valid message and returns 200', async () => {
    const response = await post(valid);
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
  });

  it('sets reply-to so a reply reaches the sender, not the site', async () => {
    await post(valid);
    expect(send.mock.calls[0]?.[0]).toMatchObject({ replyTo: valid.email });
  });

  it('rejects invalid input with 400 and does not send', async () => {
    const response = await post({ ...valid, email: 'nope' });
    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a non-JSON body with 400', async () => {
    const { POST } = await import('../route');
    const response = await POST(
      new Request('http://localhost/api/contact', { method: 'POST', body: 'not json' }),
    );
    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('returns 500 when the mail provider fails, without leaking its message', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'provider exploded' } });
    const response = await post(valid);
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('provider exploded');
  });

  it('returns 500 when the provider throws, without leaking the stack', async () => {
    send.mockRejectedValue(new Error('socket hang up'));
    const response = await post(valid);
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain('socket hang up');
  });

  it('returns 500 rather than sending when mail configuration is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const response = await post(valid);
    expect(response.status).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });

  it('never echoes the submitted message back in the response', async () => {
    const response = await post(valid);
    await expect(response.text()).resolves.not.toContain(valid.message);
  });
});
