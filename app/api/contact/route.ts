import { Resend } from 'resend';
import { contactSchema } from '@/lib/contact/schema';

/**
 * The s06 uplink endpoint.
 *
 * Provider errors are logged server-side and never returned — the client gets
 * a generic message either way. Rate limiting is deliberately out of scope for
 * a single low-traffic personal contact form; if it gets abused, add it then.
 */
export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid submission.' }, { status: 400 });
  }

  const { name, email, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error('contact: missing mail configuration');
    return Response.json({ error: 'Unavailable.' }, { status: 500 });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Uplink from ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error('contact: send failed', error);
      return Response.json({ error: 'Unavailable.' }, { status: 500 });
    }
  } catch (cause) {
    console.error('contact: send threw', cause);
    return Response.json({ error: 'Unavailable.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
