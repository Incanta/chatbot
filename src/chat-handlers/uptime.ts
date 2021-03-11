import { AuthProvider } from "twitch-auth";
import { ApiClient } from "twitch";
import { ChatHandler } from "./chat-handler";
import { differenceInHours, differenceInMinutes } from "date-fns";

export class UptimeHandler implements ChatHandler {
  private api: ApiClient;
  private command: string;
  private aliases: string[] | null;

  public modsOnly: boolean;

  constructor(
    modsOnly: boolean,
    authProvider: AuthProvider,
    command: string,
    aliases: string[] | null
  ) {
    this.modsOnly = modsOnly;
    this.api = new ApiClient({
      authProvider
    });
    this.command = command;
    this.aliases = aliases;
  }

  public async handle(
    channel: string,
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
      const stream = await this.api.helix.streams.getStreamByUserName(channel.replace(/^#/, ""));
      if (stream) {
        const now = new Date();
        const hours = differenceInHours(now, stream.startDate);
        const minutes = differenceInMinutes(now, stream.startDate);
        let timeString = "";
        if (hours > 0) {
          timeString += `${hours} hours and `;
        }
        timeString += `${minutes} minutes.`
        return `${channel} has been streaming for ${timeString}`
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}
