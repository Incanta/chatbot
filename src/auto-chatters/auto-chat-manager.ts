import config from "config";
import { ChatClient } from "twitch-chat-client";
import { Sema } from "async-sema";

import { AutoChatter } from "./auto-chatter";
import { SimpleAutoChatter } from "./simple-auto-chatter";

export interface IAutoChatterConfig {
  enabled: boolean;
  message: string | null;
}

export class AutoChatManager {
  private chatters: AutoChatter[];
  private nextChatterIdx: number;
  private frequencyMs: number;
  private chatClient: ChatClient;
  private chatterLock: Sema;

  constructor(chatClient: ChatClient) {
    this.chatters = [];
    this.nextChatterIdx = 0;
    this.frequencyMs = config.get<number>("auto-chatters.frequencyMs");
    this.chatClient = chatClient;
    this.chatterLock = new Sema(1);
  }

  public initialize(): void {
    const preconfiguredChatters = config.get<IAutoChatterConfig[]>("auto-chatters.list");
    for (const chatterConfig of preconfiguredChatters) {
      if (chatterConfig.enabled) {
        if (chatterConfig.message !== null) {
          const chatter = new SimpleAutoChatter(chatterConfig.message);
          this.chatters.push(chatter);
        } else {
          // custom chatters can be implemented here
          // these would be chatters that use some sort
          // of contextual computation during their process
          // method. (i.e. you wanted to pick a random person
          // in chat or wanted to query some API to generate
          // message to say)
        }
      }
    }
  }

  public async chat(): Promise<void> {
    await this.chatterLock.acquire();

    const message = await this.chatters[this.nextChatterIdx].process();
    if (message) {
      await this.chatClient.say(config.get<string>("twitch.auto-chatters.channel"), message);
    }
    this.nextChatterIdx = (this.nextChatterIdx + 1) % this.chatters.length;

    this.chatterLock.release();
  }

  public start(): void {
    setInterval(() => this.chat(), this.frequencyMs);
  }

  public async addChatter(chatter: AutoChatter): Promise<void> {
    await this.chatterLock.acquire();

    this.chatters.push(chatter);

    this.chatterLock.release();
  }
}