import * as Notifications from "expo-notifications";

// First, set the handler that will cause the notification
// to show the alert

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function requestNotificationPermission() {
  const result = await Notifications.requestPermissionsAsync();

  return result.status === "granted";
}

export { requestNotificationPermission };
