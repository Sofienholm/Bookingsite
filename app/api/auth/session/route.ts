import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

// POST /api/auth/session — opret session cookie fra Firebase ID token
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Mangler token." }, { status: 400 });
    }

    const adminAuth = getAdminAuth();

    // Verificér token og tjek at det er admin-emailen
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminEmail = process.env.ADMIN_EMAIL;

    if (adminEmail && decoded.email !== adminEmail) {
      return NextResponse.json(
        { error: "Ingen adgang." },
        { status: 403 }
      );
    }

    // Opret session cookie (5 dage)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Session error:", err);
    return NextResponse.json({ error: "Login fejlede." }, { status: 401 });
  }
}

// DELETE /api/auth/session — log ud
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("session", "", { maxAge: 0, path: "/" });
  return res;
}
