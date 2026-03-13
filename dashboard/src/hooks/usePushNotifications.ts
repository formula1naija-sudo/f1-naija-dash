// All notifications are now handled by the server-side push service on Railway.
// In-browser notification firing removed — it caused duplicate notifications and
// flooded users with stale data every time the PWA was opened.
//
// What the push service now sends:
//  • 10-minute pre-session reminders (Practice, Qualifying, Race)
//  • Session-end summaries: "Norris takes Pole", "Verstappen wins"
//  • Real-time critical alerts: Red Flag, Safety Car, VSC, Rain
//  • Race Control messages: penalties, investigations
//
// To manage notification preferences, see the push service on Railway.

export function usePushNotifications() {
  // intentionally empty — server handles all notifications
}
