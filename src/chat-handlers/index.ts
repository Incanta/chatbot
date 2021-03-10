import config from "config";

import { ChatHandler } from "./chat-handler";
import { SimpleHandler } from "./simple";

export interface IChatHandlerConfig {
  enabled: boolean;
  command: string;
  response: string | null;
  aliases: null | string[];
}

interface IChatHandlerListItems {
  [name: string]: IChatHandlerConfig;
}

export async function InitializeHandlers(): Promise<ChatHandler[]> {
  const handlers: ChatHandler[] = [];

  const preconfiguredChatHandlers = config.get<IChatHandlerListItems>("chat-handlers");
  for (const [_hanlderName, handlerConfig] of Object.entries(preconfiguredChatHandlers)) {
    if (handlerConfig.enabled) {
      if (handlerConfig.response !== null) {
        const handler = new SimpleHandler(handlerConfig.command, handlerConfig.response, handlerConfig.aliases);
        handlers.push(handler);
      } else {
        // here is where custom chat handlers get initialized
        // these would be anything that isn't a simple, fixed response
      }
    }
  }

  return handlers;
}
