import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Ingen kode modtaget" }, { status: 400 });
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: "http://localhost:3000/api/auth/callback",
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (data.refresh_token) {
    return new NextResponse(
      `<html>
        <body style="font-family:system-ui;padding:40px;max-width:600px;margin:auto">
          <h1>Dit nye Refresh Token</h1>
          <p>Kopiér denne værdi og indsæt den som <code>GOOGLE_REFRESH_TOKEN</code> i din <code>.env.local</code>:</p>
          <textarea style="width:100%;height:100px;padding:12px;font-size:14px;border:2px solid #7474D4;border-radius:12px" readonly>${data.refresh_token}</textarea>
          <p style="margin-top:20px;color:#666">Når du har kopieret den, kan du lukke denne side.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return NextResponse.json({ error: "Kunne ikke hente token", details: data }, { status: 400 });
}
