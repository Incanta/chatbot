export abstract class ChatHandler {
  public abstract modsOnly: boolean;
  public abstract handle(
    channel: string,
    message: string,
    user: string,
    isMod: boolean
  ): Promise<null | string>;
}
