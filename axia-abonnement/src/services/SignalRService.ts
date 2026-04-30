import * as signalR from "@microsoft/signalr";
import { HUB_URL } from "../api/config";
import { getToken } from "../utils/auth";
import type { NotificationItem } from "../types";

type SignalRHandlers = {
  onNotification?: (notif: NotificationItem) => void;
  onNewMessage?: () => void;
  onStaffReplied?: () => void;
};

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectCallbacks: Array<(connectionId?: string) => void> = [];

  public createConnection(handlers: SignalRHandlers) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => getToken() ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();

    if (handlers.onNotification) {
      this.connection.on("ReceiveNotification", (notif: unknown) => {
        handlers.onNotification!({
          ...(notif as NotificationItem),
          isRead: false,
        });
      });
    }

    if (handlers.onNewMessage) {
      this.connection.on("NewConversationMessage", handlers.onNewMessage);
    }

    if (handlers.onStaffReplied) {
      this.connection.on("StaffReplied", handlers.onStaffReplied);
    }

    // Rejoindre les groupes après reconnexion automatique
    this.connection.onreconnected((connectionId) => {
      this.reconnectCallbacks.forEach((cb) => cb(connectionId));
    });
  }

  public async startConnection() {
    if (!this.connection) return;
    try {
      await this.connection.start();
    } catch (err) {
      console.error("Erreur SignalR:", err);
    }
  }

  public async stopConnection() {
    this.reconnectCallbacks = [];
    await this.connection?.stop();
    this.connection = null;
  }

  public async joinConversation(conversationId: string) {
    try {
      await this.connection?.invoke("JoinConversation", conversationId);
    } catch (err) {
      console.warn("SignalR joinConversation failed:", err);
    }
  }

  public async leaveConversation(conversationId: string) {
    try {
      await this.connection?.invoke("LeaveConversation", conversationId);
    } catch (err) {
      console.warn("SignalR leaveConversation failed:", err);
    }
  }

  public onReconnected(callback: (connectionId?: string) => void) {
    this.reconnectCallbacks.push(callback);
  }

  public offReconnected(callback: (connectionId?: string) => void) {
    this.reconnectCallbacks = this.reconnectCallbacks.filter(
      (cb) => cb !== callback,
    );
  }

  public on(event: string, callback: (...args: unknown[]) => void) {
    this.connection?.on(event, callback);
  }

  public off(event: string, callback: (...args: unknown[]) => void) {
    this.connection?.off(event, callback);
  }

  public getConnection() {
    return this.connection;
  }
}
