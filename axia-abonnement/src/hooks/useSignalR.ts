import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { HUB_URL } from "../api/config";
import { getToken } from '../utils/auth';

type EventHandlers = Record<string, (...args: unknown[]) => void>;

interface UseSignalROptions {
  enabled?: boolean;
  onConnected?: (connection: signalR.HubConnection) => void;
}

export function useSignalR(
  handlers: EventHandlers,
  options: UseSignalROptions = {}
) {
  const { enabled = true, onConnected } = options;
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => getToken() ?? "" })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();

    Object.entries(handlers).forEach(([event, handler]) => {
      connection.on(event, handler);
    });

    connection
      .start()
      .then(() => onConnected?.(connection))
      .catch(() => {});

    connectionRef.current = connection;

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return connectionRef;
}