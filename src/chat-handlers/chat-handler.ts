export abstract class ChatHandler {
  public abstract handle(
    channel: string,
    message: string,
    user: string
  ): Promise<null | string>;
}
