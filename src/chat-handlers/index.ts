import config from "config";
import { AuthProvider } from "twitch-auth";

import { ChatHandler } from "./chat-handler";
import { ShoutOutHandler } from "./shout-out";
import { SimpleHandler } from "./simple";
import { UptimeHandler } from "./uptime";

export interface IChatHandlerConfig {
  enabled: boolean;
  command: string;
  response: string | null;
  aliases: null | string[];
}

interface IChatHandlerListItems {
  [name: string]: IChatHandlerConfig;
}

export async function InitializeHandlers(auth: AuthProvider): Promise<ChatHandler[]> {
  const handlers: ChatHandler[] = [];

  const preconfiguredChatHandlers = config.get<IChatHandlerListItems>("chat-handlers");
  for (const [handlerName, handlerConfig] of Object.entries(preconfiguredChatHandlers)) {
    if (handlerConfig.enabled) {
      if (handlerConfig.response !== null) {
        const handler = new SimpleHandler(handlerConfig.command, handlerConfig.response, handlerConfig.aliases);
        handlers.push(handler);
      } else {
        // here is where custom chat handlers get initialized
        // these would be anything that isn't a simple, fixed response
        switch (handlerName) {
          case "so": {
            const handler = new ShoutOutHandler(
              handlerConfig.command,
              config.get<string>("shout-outs.generic-message"),
              handlerConfig.aliases
            );
            handlers.push(handler);
            break;
          }
          case "uptime": {
            const handler = new UptimeHandler(
              auth,
              handlerConfig.command,
              handlerConfig.aliases
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
