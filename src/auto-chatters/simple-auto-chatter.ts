import { AutoChatter } from "./auto-chatter";

export class SimpleAutoChatter implements AutoChatter {
  private recurringMessage?: string;
  public name: string;

  constructor(name: string, recurringMessage?: string) {
    this.name = name;
    this.recurringMessage = recurringMessage;
  }

  public async process(): Promise<string | null> {
    if (this.recurringMessage) {
      return this.recurringMessage;
    } else {
      return null;
    }
  }
}
