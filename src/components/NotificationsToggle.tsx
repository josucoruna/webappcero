"use client";

import { useEffect, useState } from "react";

import {
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/actions/pushSubscriptions";
import { Button } from "@/components/ui/Button";

type Status = "checking" | "unsupported" | "denied" | "subscribed" | "off";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function NotificationsToggle() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    async function check() {
      if (
        !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "subscribed" : "off");
    }
    check().catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "denied" : "off");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;
    await subscribeToPush({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    });
    setStatus("subscribed");
  }

  async function disable() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await unsubscribeFromPush(subscription.endpoint);
      await subscription.unsubscribe();
    }
    setStatus("off");
  }

  if (status === "checking" || status === "unsupported") return null;

  if (status === "denied") {
    return (
      <p className="text-sm text-muted">
        Bloqueaste las notificaciones para esta página. Actívalas desde los
        ajustes del navegador si quieres recibir avisos aquí.
      </p>
    );
  }

  return status === "subscribed" ? (
    <Button variant="secondary" size="sm" onClick={disable}>
      Desactivar notificaciones
    </Button>
  ) : (
    <Button variant="primary" size="sm" onClick={enable}>
      Activar notificaciones
    </Button>
  );
}
