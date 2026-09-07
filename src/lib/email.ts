import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    // Sin API key configurada (ej. en desarrollo local): dejamos el enlace
    // en los logs del servidor en vez de fallar, para poder probar el flujo.
    console.log(`[email] Enlace para restablecer la contraseña de ${to}: ${resetUrl}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "LuaOne <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to,
    subject: "Restablece tu contraseña de LuaOne",
    html: `
      <p>Has pedido restablecer tu contraseña en LuaOne.</p>
      <p><a href="${resetUrl}">Haz clic aquí para elegir una nueva contraseña</a>. El enlace caduca en 1 hora.</p>
      <p>Si no has sido tú, puedes ignorar este email.</p>
    `,
  });
}
