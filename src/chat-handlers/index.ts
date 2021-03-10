import config from "config";

import { ChatHandler } from "./chat-handler";
import { PingHandler } from "./ping";

export async function InitializeHandlers(): Promise<ChatHandler[]> {
  const handlers: ChatHandler[] = [];

  if (config.get<boolean>("chat-handlers.ping.enabled")) {
    const ping = new PingHandler();
    handlers.push(ping);
  }

  return handlers;
}
