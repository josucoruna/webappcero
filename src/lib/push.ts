import webpush from "web-push";

import { prisma } from "@/lib/prisma";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails("mailto:soporte@luaone.es", publicKey, privateKey);
}

/** Manda una notificación push a todos los dispositivos de una persona. No
 * lanza si falla (o si las notificaciones no están configuradas): una
 * notificación no debería romper la acción que la dispara. */
export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url: string },
) {
  if (!publicKey || !privateKey) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
          // Sin esto, un endpoint caído puede dejar la petición colgada y
          // bloquear con ella la asignación/rechazo que la dispara.
          { TTL: 60, timeout: 8000 },
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // El dispositivo desinstaló la app o revocó el permiso.
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        } else {
          console.error("Error enviando notificación push", error);
        }
      }
    }),
  );
}
