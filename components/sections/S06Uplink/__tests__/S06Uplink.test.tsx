import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { S06Uplink } from '../index';
import { CHANNELS, UPLINK } from '@/content/uplink';

function mockFetch(status: number) {
  const fn = vi.fn(async () => new Response(JSON.stringify({ ok: status === 200 }), { status }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => {
  vi.unstubAllGlobals();
  mockFetch(200);
});

async function fill(user: ReturnType<typeof userEvent.setup>, message: string) {
  await user.type(screen.getByLabelText(UPLINK.fields.name.label), 'Ada');
  await user.type(screen.getByLabelText(UPLINK.fields.email.label), 'ada@example.com');
  await user.type(screen.getByLabelText(UPLINK.fields.message.label), message);
  await user.click(screen.getByRole('button', { name: UPLINK.submit }));
}

describe('S06Uplink', () => {
  it('labels every field so it is reachable by name', () => {
    render(<S06Uplink />);
    expect(screen.getByLabelText(UPLINK.fields.name.label)).toBeInTheDocument();
    expect(screen.getByLabelText(UPLINK.fields.email.label)).toBeInTheDocument();
    expect(screen.getByLabelText(UPLINK.fields.message.label)).toBeInTheDocument();
  });

  it('surfaces a validation error and does not POST', async () => {
    const fetchFn = mockFetch(200);
    const user = userEvent.setup();
    render(<S06Uplink />);
    await fill(user, 'hi');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('marks the offending field invalid and describes why', async () => {
    const user = userEvent.setup();
    render(<S06Uplink />);
    await fill(user, 'hi');
    const message = screen.getByLabelText(UPLINK.fields.message.label);
    expect(message).toHaveAttribute('aria-invalid', 'true');
    expect(message).toHaveAttribute('aria-describedby');
  });

  it('POSTs a valid message and shows the success state', async () => {
    const fetchFn = mockFetch(200);
    const user = userEvent.setup();
    render(<S06Uplink />);
    await fill(user, 'A genuine enquiry, at length.');
    expect(fetchFn).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
    expect(await screen.findByRole('status')).toHaveTextContent(UPLINK.success);
  });

  it('surfaces a server failure without claiming success', async () => {
    mockFetch(500);
    const user = userEvent.setup();
    render(<S06Uplink />);
    await fill(user, 'A genuine enquiry, at length.');
    expect(await screen.findByRole('alert')).toHaveTextContent(UPLINK.failure);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('surfaces a network failure without claiming success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    const user = userEvent.setup();
    render(<S06Uplink />);
    await fill(user, 'A genuine enquiry, at length.');
    expect(await screen.findByRole('alert')).toHaveTextContent(UPLINK.failure);
  });

  it('renders every contact channel, with links where there is one', () => {
    render(<S06Uplink />);
    for (const channel of CHANNELS) {
      expect(screen.getByText(channel.label)).toBeInTheDocument();
      if (channel.href) {
        expect(screen.getByRole('link', { name: channel.value })).toHaveAttribute('href', channel.href);
      }
    }
  });

  it('renders the section heading and the footer credit', () => {
    render(<S06Uplink />);
    expect(screen.getByRole('heading', { level: 2, name: 'UPLINK' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
