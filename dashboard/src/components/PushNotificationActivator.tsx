"use client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
export default function PushNotificationActivator() {
  usePushNotifications();
  return null;
}
