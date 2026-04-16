import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";

export function useNotifications() {
  return useContext(NotificationContext);
}