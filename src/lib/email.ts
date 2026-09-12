import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function send(
  to: string,
  subject: string,
  html: string,
  options?: { replyTo?: string },
) {
  if (!resend) {
    // Sin API key configurada (ej. en desarrollo local): dejamos el email
    // en los logs del servidor en vez de fallar, para poder probar el flujo.
    console.log(`[email] Para ${to} — ${subject}\n${html}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "LuaOne <onboarding@resend.dev>";
  await resend.emails.send({
    from,
    to,
    subject,
    html,
    replyTo: options?.replyTo,
  });
}

function formatServiceDate(date: Date) {
  return date.toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" });
}

/** Escapa texto de usuario antes de meterlo en el HTML del email. */
function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await send(
    to,
    "Restablece tu contraseña de LuaOne",
    `
      <p>Has pedido restablecer tu contraseña en LuaOne.</p>
      <p><a href="${resetUrl}">Haz clic aquí para elegir una nueva contraseña</a>. El enlace caduca en 1 hora.</p>
      <p>Si no has sido tú, puedes ignorar este email.</p>
    `,
  );
}

/** Avisa a un miembro de que le han asignado un puesto en un servicio. */
export async function sendAssignmentEmail(
  to: string,
  params: {
    positionName: string;
    serviceTitle: string;
    teamName: string;
    serviceDate: Date;
    serviceUrl: string;
  },
) {
  const positionName = escapeHtml(params.positionName);
  const serviceTitle = escapeHtml(params.serviceTitle);
  const teamName = escapeHtml(params.teamName);
  await send(
    to,
    `Te han asignado a "${params.positionName}" · ${params.serviceTitle}`,
    `
      <p>Te han asignado el puesto <strong>${positionName}</strong> en
      <strong>${serviceTitle}</strong> (${teamName}), el
      ${formatServiceDate(params.serviceDate)}.</p>
      <p><a href="${params.serviceUrl}">Confirma o rechaza la asignación aquí</a>.</p>
    `,
  );
}

/** Reenvía un mensaje del formulario de contacto de la portada. */
export async function sendContactEmail(params: {
  name: string;
  email: string;
  message: string;
}) {
  const name = escapeHtml(params.name);
  const message = escapeHtml(params.message).replace(/\n/g, "<br>");
  await send(
    process.env.CONTACT_EMAIL || "info@luaone.es",
    `Contacto desde la web: ${params.name}`,
    `
      <p><strong>${name}</strong> (${escapeHtml(params.email)}) ha escrito desde el formulario de contacto:</p>
      <p>${message}</p>
    `,
    { replyTo: params.email },
  );
}

/** Avisa a los líderes de un equipo de que alguien ha rechazado su asignación. */
export async function sendDeclineNotificationEmail(
  to: string,
  params: {
    memberName: string;
    positionName: string;
    serviceTitle: string;
    teamName: string;
    declineReason: string;
    serviceUrl: string;
  },
) {
  const memberName = escapeHtml(params.memberName);
  const positionName = escapeHtml(params.positionName);
  const serviceTitle = escapeHtml(params.serviceTitle);
  const teamName = escapeHtml(params.teamName);
  const declineReason = escapeHtml(params.declineReason);
  await send(
    to,
    `${params.memberName} ha rechazado "${params.positionName}" · ${params.serviceTitle}`,
    `
      <p><strong>${memberName}</strong> ha rechazado el puesto
      <strong>${positionName}</strong> en
      <strong>${serviceTitle}</strong> (${teamName}).</p>
      <p>Motivo: ${declineReason}</p>
      <p><a href="${params.serviceUrl}">Reasigna el puesto aquí</a>.</p>
    `,
  );
}
