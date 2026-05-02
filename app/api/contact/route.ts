import { NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/email";

export const runtime = "nodejs";

function validateContactPayload(body: Record<string, unknown>) {
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const message = String(body.message ?? "").trim();

  if (!fullName || !phone || !email || !message) {
    return { error: "Tous les champs sont obligatoires." };
  }

  if (fullName.length < 2) {
    return { error: "Nom complet invalide." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email invalide." };
  }

  if (message.length < 8) {
    return { error: "Message trop court." };
  }

  return {
    data: {
      fullName,
      phone,
      email,
      message
    }
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const validated = validateContactPayload(body);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const result = await sendContactNotification(validated.data);

    if (result.skipped) {
      return NextResponse.json(
        { error: "Configuration email manquante." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send contact notification email", error);
    return NextResponse.json(
      { error: "Impossible d’envoyer le message pour le moment." },
      { status: 502 }
    );
  }
}
