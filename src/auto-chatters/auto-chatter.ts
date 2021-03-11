export abstract class AutoChatter {
  public abstract name: string;
  public abstract process(): Promise<string | null>;
}
