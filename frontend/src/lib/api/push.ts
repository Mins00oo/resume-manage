import { api } from '../api';
import type { ApiResponse } from '../../types/api';

export type PushSubscriptionRequest = {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent?: string;
};

export const pushApi = {
  getVapidPublicKey: (): Promise<string> =>
    api
      .get<ApiResponse<{ publicKey: string }>>('/api/me/push/vapid-public-key')
      .then((r) => r.data.data?.publicKey ?? ''),

  subscribe: (req: PushSubscriptionRequest): Promise<void> =>
    api.post<ApiResponse<void>>('/api/me/push/subscriptions', req).then(() => undefined),

  unsubscribe: (endpoint: string): Promise<void> =>
    api
      .delete<ApiResponse<void>>('/api/me/push/subscriptions', { params: { endpoint } })
      .then(() => undefined),
};

/**
 * Web Push 구독 유틸. 권한 요청, service worker 등록, PushManager.subscribe 를 감싼 함수.
 * 사용 전에 navigator.serviceWorker 가 available 한지 먼저 확인하세요.
 */
export async function ensurePushSubscription(vapidPublicKey: string): Promise<PushSubscriptionRequest | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  if (Notification.permission === 'denied') return null;

  let permission: NotificationPermission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
    });
  }
  const json = subscription.toJSON();
  const keys = (json.keys ?? {}) as { p256dh?: string; auth?: string };
  if (!json.endpoint || !keys.p256dh || !keys.auth) return null;

  return {
    endpoint: json.endpoint,
    p256dhKey: keys.p256dh,
    authKey: keys.auth,
    userAgent: navigator.userAgent,
  };
}

export async function removePushSubscription(): Promise<string | null> {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
