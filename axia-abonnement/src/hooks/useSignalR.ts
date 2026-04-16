import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { HUB_URL } from "../api/config";
import { getToken } from "../utils/auth";

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
  const handlersRef = useRef<EventHandlers>(handlers);
  const registeredEventsRef = useRef<string[]>([]);

  // Toujours garder les handlers à jour (sans recréer la connexion)
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => getToken() ?? "" })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    const eventNames = Object.keys(handlersRef.current);
    registeredEventsRef.current = eventNames;

    for (const eventName of eventNames) {
      connection.on(eventName, (...args: unknown[]) => {
        const fn = handlersRef.current[eventName];
        if (fn) fn(...args);
      });
    }

    (async () => {
      try {
        await connection.start();

        if (disposed) {
          await connection.stop();
          return;
        }

        onConnected?.(connection);
      } catch (err) {
        const msg = String((err as Error)?.message ?? "");
        const isExpectedAbort =
          msg.includes("stopped during negotiation") ||
          msg.includes("before the hub handshake could complete") ||
          msg.includes("AbortError");

        // On ignore les aborts attendus pendant cleanup/remount
        if (!isExpectedAbort && !disposed) {
          console.error("[SignalR] start failed:", err);
        }
      }
    })();

    return () => {
      disposed = true;

      // Nettoyage listeners
      for (const eventName of registeredEventsRef.current) {
        connection.off(eventName);
      }
      registeredEventsRef.current = [];

      void connection.stop();
      connectionRef.current = null;
    };
  }, [enabled, onConnected]);

  return connectionRef;
}