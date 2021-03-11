import config from "config";
import { AuthProvider } from "twitch-auth";

import { AutoChatManager } from "../auto-chatters/auto-chat-manager";
import { ChatHandler } from "./chat-handler";
import { SetHandler } from "./set";
import { ShoutOutHandler } from "./shout-out";
import { SimpleHandler } from "./simple";
import { UptimeHandler } from "./uptime";

export interface IChatHandlerConfig {
  enabled: boolean;
  "mods-only": boolean;
  command: string;
  response: string | null;
  aliases: null | string[];
}

interface IChatHandlerListItems {
  [name: string]: IChatHandlerConfig;
}

export async function InitializeHandlers(auth: AuthProvider, autoChat: AutoChatManager): Promise<ChatHandler[]> {
  const handlers: ChatHandler[] = [];

  const preconfiguredChatHandlers = config.get<IChatHandlerListItems>("chat-handlers");
  for (const [handlerName, handlerConfig] of Object.entries(preconfiguredChatHandlers)) {
    if (handlerConfig.enabled) {
      if (handlerConfig.response !== null) {
        const handler = new SimpleHandler(
          handlerConfig["mods-only"],
          handlerConfig.command,
          handlerConfig.response,
          handlerConfig.aliases
        );
        handlers.push(handler);
      } else {
        // here is where custom chat handlers get initialized
        // these would be anything that isn't a simple, fixed response
        switch (handlerName) {
          case "so": {
            const handler = new ShoutOutHandler(
              handlerConfig["mods-only"],
              handlerConfig.command,
              config.get<string>("shout-outs.generic-message"),
              handlerConfig.aliases
            );
            handlers.push(handler);
            break;
          }
          case "uptime": {
            const handler = new UptimeHandler(
              handlerConfig["mods-only"],
              auth,
              handlerConfig.command,
              handlerConfig.aliases
            );
            handlers.push(handler);
            break;
          }
          case "set": {
            const handler = new SetHandler(
              handlerConfig["mods-only"],
              autoChat
            );
            handlers.push(handler);
            break;
          }
        }
      }
    }
  }

  return handlers;
}
