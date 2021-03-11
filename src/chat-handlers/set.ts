import { AutoChatManager } from "../auto-chatters/auto-chat-manager";
import { SimpleAutoChatter } from "../auto-chatters/simple-auto-chatter";
import { ChatHandler } from "./chat-handler";

interface ICustomHandler {
  channel: string;
  command: string;
  response: string;
}

export class SetHandler implements ChatHandler {
  private autoChat: AutoChatManager;
  private customHandlers: ICustomHandler[];

  public modsOnly: boolean;

  constructor(
    modsOnly: boolean,
    autoChat: AutoChatManager
  ) {
    this.modsOnly = modsOnly;
    this.autoChat = autoChat;
    this.customHandlers = [];
  }

  public async handle(
    channel: string,
    message: string,
    _user: string
  ): Promise<string | null> {
    const trimmedMessage = message.trim();

    // TODO: make sure user doing set/rm/clear is mod

    let regex = new RegExp(`^!set (handler|autochatter) (.+) "(.+)"`);
    let match = regex.exec(trimmedMessage);

    if (match && match.length >= 3) {
      const type = match[1] as "handler" | "autochatter";
      const command = match[2];
      const response = match[3];

      if (type === "handler") {
        const idx = this.customHandlers.findIndex(handler => handler.command === command);
        if (idx >= 0) {
          this.customHandlers[idx] = {
            channel,
            command,
            response,
          };
        } else {
          this.customHandlers.push({
            channel,
            command,
            response,
          });
        }
      } else {
        const chatter = new SimpleAutoChatter(command, response);
        await this.autoChat.setChatter(chatter);
      }

      return `Command ${command} set!`;
    }

    regex = new RegExp(`^!rm (handler|autochatter) (.+)`);
    match = regex.exec(trimmedMessage);

    if (match && match.length >= 2) {
      const type = match[1] as "handler" | "autochatter";
      const command = match[2];

      if (type === "handler") {
        const idx = this.customHandlers.findIndex(
          handler => handler.command === command && handler.channel === channel
        );
        if (idx >= 0) {
          this.customHandlers.splice(idx, 1);
        }
      } else {
        await this.autoChat.rmChatter(command);
      }

      return `Command ${command} removed!`;
    }

    for (const handler of this.customHandlers) {
      if (handler.command === message && handler.channel === channel) {
        return handler.response;
      }
    }

    return null;
  }
}
