import config from "config";

import { ChatHandler } from "./chat-handler";

export class ShoutOutHandler implements ChatHandler {
  private response: string;
  private aliases: string[];

  public modsOnly: boolean;

  constructor(
    modsOnly: boolean,
    command: string,
    response: string,
    aliases: string[] | null
  ) {
    this.modsOnly = modsOnly;
    this.response = response;
    this.aliases = (aliases || []).concat(command);
  }

  public async handle(
    _channel: string,
    message: string,
    _user: string
  ): Promise<string | null> {
    const trimmedMessage = message.trim();
    const regex = new RegExp(`^(${this.aliases.join("|").replace(/!/g, "\\!")}) (.+)`);
    const match = regex.exec(trimmedMessage);
    if (match && match.length >= 3) {
      const username = match[2].toLowerCase();
      const message = config.has(`shout-outs.list.${username}`) ?
        config.get<string>(`shout-outs.list.${username}.message`) :
        this.response.replace(/_USER_/g, username)

      return message;
    } else {
      return null;
    }
  }
}
