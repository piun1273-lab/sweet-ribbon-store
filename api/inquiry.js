const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, message: 'POST 요청만 허용됩니다.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.RESEND_TO_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sweet Ribbon <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    return response.status(500).json({ ok: false, message: '메일 환경설정이 완료되지 않았습니다.' });
  }

  const {
    name = '',
    phone = '',
    eventDate = '',
    quantity = '',
    estimate = '',
    message = '',
    website = ''
  } = request.body || {};

  // Hidden honeypot field: bots often fill this, real customers do not.
  if (website) return response.status(200).json({ ok: true });

  if (!String(name).trim() || !String(phone).trim() || !String(eventDate).trim() || !String(quantity).trim()) {
    return response.status(400).json({ ok: false, message: '필수 정보를 모두 입력해 주세요.' });
  }

  const safeName = escapeHtml(String(name).trim().slice(0, 80));
  const safePhone = escapeHtml(String(phone).trim().slice(0, 40));
  const safeDate = escapeHtml(String(eventDate).trim().slice(0, 30));
  const safeQuantity = escapeHtml(String(quantity).trim().slice(0, 20));
  const safeEstimate = escapeHtml(String(estimate).trim().slice(0, 500));
  const safeMessage = escapeHtml(String(message).trim().slice(0, 3000)).replaceAll('\n', '<br>');

  try {
    const resendResponse = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `[Sweet Ribbon 상담 문의] ${safeName} · ${safeQuantity}세트`,
        html: `
          <div style="max-width:640px;margin:auto;padding:32px;font-family:Arial,'Apple SD Gothic Neo',sans-serif;color:#3f2b20">
            <h1 style="font-size:24px;margin:0 0 24px">새로운 상담 문의가 도착했습니다</h1>
            <table style="width:100%;border-collapse:collapse;font-size:15px">
              <tr><th style="padding:12px;text-align:left;background:#f5f1ec;border:1px solid #e9e0d7">성함 / 단체명</th><td style="padding:12px;border:1px solid #e9e0d7">${safeName}</td></tr>
              <tr><th style="padding:12px;text-align:left;background:#f5f1ec;border:1px solid #e9e0d7">연락처</th><td style="padding:12px;border:1px solid #e9e0d7">${safePhone}</td></tr>
              <tr><th style="padding:12px;text-align:left;background:#f5f1ec;border:1px solid #e9e0d7">희망 배송일</th><td style="padding:12px;border:1px solid #e9e0d7">${safeDate}</td></tr>
              <tr><th style="padding:12px;text-align:left;background:#f5f1ec;border:1px solid #e9e0d7">희망 수량</th><td style="padding:12px;border:1px solid #e9e0d7">${safeQuantity}세트</td></tr>
              <tr><th style="padding:12px;text-align:left;background:#f5f1ec;border:1px solid #e9e0d7">선택 견적</th><td style="padding:12px;border:1px solid #e9e0d7">${safeEstimate || '미입력'}</td></tr>
              <tr><th style="padding:12px;text-align:left;background:#f5f1ec;border:1px solid #e9e0d7">문의 내용</th><td style="padding:12px;border:1px solid #e9e0d7;line-height:1.7">${safeMessage || '미입력'}</td></tr>
            </table>
          </div>`
      })
    });

    const result = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      console.error('Resend error:', resendResponse.status, result);
      return response.status(502).json({ ok: false, message: '메일 전송에 실패했습니다.' });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Inquiry error:', error);
    return response.status(500).json({ ok: false, message: '메일 전송 중 오류가 발생했습니다.' });
  }
};
