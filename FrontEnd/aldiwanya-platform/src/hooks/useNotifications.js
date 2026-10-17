import { useContext } from "react";
import { NotificationsContext } from "../context/notifications-context";
export default function useNotifications() {
  return useContext(NotificationsContext);
}
