import { ChatHandler } from "./chat-handler";

export class SimpleHandler implements ChatHandler {
  private command: string;
  private response: string;
  private aliases: string[] | null;

  public modsOnly: boolean;

  constructor(
    modsOnly: boolean,
    command: string,
    response: string,
    aliases: string[] | null
  ) {
    this.modsOnly = modsOnly;
    this.command = command;
    this.response = response;
    this.aliases = aliases;
  }

  public async handle(
    _channel: string,
    message: string,
    _user: string
  ): Promise<string | null> {
    const trimmedMessage = message.trim();
    if (
      trimmedMessage === this.command ||
      (
        this.aliases !== null && this.aliases.includes(trimmedMessage)
      )
    ) {
      return this.response;
    } else {
      return null;
    }
  }
}
