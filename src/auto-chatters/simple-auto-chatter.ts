import { AutoChatter } from "./auto-chatter";

export class SimpleAutoChatter implements AutoChatter {
  private recurringMessage?: string;

  constructor( recurringMessage?: string) {
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
