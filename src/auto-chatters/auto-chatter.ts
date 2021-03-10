export abstract class AutoChatter {
  public abstract process(): Promise<string | null>;
}
