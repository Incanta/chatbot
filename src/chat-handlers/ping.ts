import { ChatHandler } from "./chat-handler";

export class PingHandler implements ChatHandler {
  public async handle(
    _channel: string,
    _message: string,
    _user: string
  ): Promise<string | null> {
    return "Pong!";
  }
}
