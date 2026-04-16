export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, name, top5, pin } = body;
  if (!email || !name || !top5 || !pin) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const firstName = name.split(" ")[0];
  const html = buildEmailHTML(firstName, top5, email, pin);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        from: "MJ Leigh <mj@mjleigh.com>",
        to: [email],
        subject: firstName + ", your strengths results are in",
        html: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: "Resend API error", detail: errText }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Server error", message: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const DOMAIN_COLORS = {
  executing: "#F59E0B",
  influencing: "#8B5CF6",
  relationship_building: "#10B981",
  strategic_thinking: "#3B82F6",
};

const DOMAIN_LABELS = {
  executing: "Executing",
  influencing: "Influencing",
  relationship_building: "Relationship Building",
  strategic_thinking: "Strategic Thinking",
};

function buildEmailHTML(firstName, top5, email, pin) {
  const themeCards = top5.map((t, i) => {
    const color = DOMAIN_COLORS[t.domain] || "#6D28D9";
    const domainLabel = DOMAIN_LABELS[t.domain] || "";
    return `
      <tr>
        <td style="padding: 0 0 16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background: #ffffff; border: 1px solid #e8e6f0; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="padding: 20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <span style="display: inline-block; background: ${color}22; color: ${color};
                        font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
                        padding: 3px 10px; border-radius: 20px; margin-bottom: 8px;">${domainLabel}</span>
                      <div style="font-size: 11px; color: #9999aa; font-weight: 600; margin-bottom: 4px;">
                        #${i + 1}
                      </div>
                      <div style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px;">
                        ${t.name}
                      </div>
                      <div style="font-size: 14px; line-height: 1.6; color: #555570;">
                        ${t.desc}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Strengths Results</title>
</head>
<body style="margin: 0; padding: 0; background: #f4f2fa; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f4f2fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a0a2e 0%, #0a0a1a 100%);
              border-radius: 16px 16px 0 0; padding: 40px 40px 36px; text-align: center;">
              <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
                color: #a78bfa; font-weight: 700; margin-bottom: 16px;">ARC Strengths Discovery</div>
              <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 800; color: #ffffff; line-height: 1.2;">
                Your results are in, ${firstName}.
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                Here are the top 5 themes that define how you naturally think, feel, and behave.
              </p>
            </td>
          </tr>

          <!-- Top 5 cards -->
          <tr>
            <td style="background: #f8f7fc; padding: 32px 32px 8px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${themeCards}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background: #f8f7fc; padding: 8px 32px 40px; text-align: center;">
              <p style="font-size: 14px; color: #555570; line-height: 1.6; margin: 0 0 24px;">
                Your full report — including all 34 ranked themes, domain breakdown, and personalized insights — is waiting for you.
              </p>
              <a href="https://strengths.mjleigh.com"
                style="display: inline-block; background: #6D28D9; color: #ffffff;
                  font-size: 15px; font-weight: 700; text-decoration: none;
                  padding: 14px 32px; border-radius: 10px; letter-spacing: 0.3px;">
                View My Full Report →
              </a>
              <p style="font-size: 12px; color: #9999aa; margin: 20px 0 0; line-height: 1.6;">
                Go to <strong>strengths.mjleigh.com</strong>, enter your email
                (<strong>${email}</strong>), and use your PIN <strong>${pin}</strong> to access your results.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #1a0a2e; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.6;">
                This report was generated by ARC Strengths Discovery.<br />
                If you didn't take this assessment, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
