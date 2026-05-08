const RECIPIENT = 'editorial@amarearchitecture.com';
const FROM = 'Amaré Waitlist <waitlist@amarearchitecture.com>';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, city, industry, source } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const subject = `New waitlist signup — ${name?.trim() || email}`;
  const text = [
    `Email:    ${email}`,
    `Name:     ${name || '—'}`,
    `City:     ${city || '—'}`,
    `Practice: ${industry || '—'}`,
    `Source:   ${source || '—'}`,
    ``,
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0A0E1A; max-width: 560px;">
      <p style="font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; color: #C9A961; margin: 0 0 24px;">— Amaré Waitlist</p>
      <h1 style="font-family: 'Bodoni Moda', Didot, Garamond, serif; font-weight: 400; font-size: 28px; margin: 0 0 24px;">New signup</h1>
      <table style="border-collapse: collapse; font-size: 14px; line-height: 1.6;">
        <tr><td style="padding: 6px 24px 6px 0; color: #6B6B6B;">Email</td><td style="padding: 6px 0;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding: 6px 24px 6px 0; color: #6B6B6B;">Name</td><td style="padding: 6px 0;">${esc(name || '—')}</td></tr>
        <tr><td style="padding: 6px 24px 6px 0; color: #6B6B6B;">City</td><td style="padding: 6px 0;">${esc(city || '—')}</td></tr>
        <tr><td style="padding: 6px 24px 6px 0; color: #6B6B6B;">Practice</td><td style="padding: 6px 0;">${esc(industry || '—')}</td></tr>
        <tr><td style="padding: 6px 24px 6px 0; color: #6B6B6B;">Source</td><td style="padding: 6px 0;">${esc(source || '—')}</td></tr>
      </table>
      <p style="margin-top: 32px; font-size: 11px; color: #6B6B6B;">Submitted ${new Date().toUTCString()}</p>
    </div>
  `;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [RECIPIENT],
        reply_to: email,
        subject,
        text,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Resend error', r.status, detail);
      return res.status(502).json({ error: 'Could not send email. Please try again.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Waitlist handler error', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}
