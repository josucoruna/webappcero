"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

export async function subscribeToPush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const user = await requireUser();

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { userId: user.id },
    create: {
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function unsubscribeFromPush(endpoint: string) {
  const user = await requireUser();

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: user.id },
  });
}
