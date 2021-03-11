import { promises as fs } from "fs";

import { RefreshableAuthProvider, StaticAuthProvider } from "twitch-auth";
import { ChatClient, ChatSubGiftInfo, ChatSubInfo } from "twitch-chat-client";
import config from "config";

import { InitializeHandlers } from "./chat-handlers";
import { AutoChatManager } from "./auto-chatters/auto-chat-manager";

function replaceConfigString(original: string, subInfo: ChatSubInfo): string {
  return original
    .replace(/_SUBINFO_USERID_/g, subInfo.userId)
    .replace(/_SUBINFO_DISPLAYNAME_/g, subInfo.displayName)
    .replace(/_SUBINFO_PLAN_/g, subInfo.plan)
    .replace(/_SUBINFO_PLANNAME_/g, subInfo.planName)
    .replace(/_SUBINFO_MONTHS_/g, `${subInfo.months}`)
    .replace(/_SUBINFO_STREAK_/g, `${subInfo.streak || ""}`)
    .replace(/_SUBINFO_MESSAGE_/g, `${subInfo.streak || ""}`);
}

function replaceGiftConfigString(original: string, subInfo: ChatSubGiftInfo): string {
  return replaceConfigString(original, subInfo)
    .replace(/_SUBINFO_GIFTER_DISPLAYNAME_/g, `${subInfo.gifterDisplayName || ""}`)
    .replace(/_SUBINFO_GIFTER_USERID_/g, `${subInfo.gifterUserId || ""}`)
    .replace(/_SUBINFO_GIFTER_GIFTCOUNT_/g, `${subInfo.gifterGiftCount || 1}`);
}

async function main() {
  const tokenData = JSON.parse(await fs.readFile("./token.json", "utf-8"));
  const auth = new RefreshableAuthProvider(
    new StaticAuthProvider(config.get<string>("twitch.client-id"), tokenData.accessToken),
    {
      clientSecret: config.get<string>("twitch.client-secret"),
      refreshToken: tokenData.refreshToken,
      expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
      onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
        const newTokenData = {
          accessToken,
          refreshToken,
          expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
        };
        await fs.writeFile("./token.json", JSON.stringify(newTokenData, null, 4), "utf-8")
      }
    }
  );

  const chatClient = new ChatClient(auth, { channels: config.get<string[]>("channels") });
  await chatClient.connect();

  const autoChatManger = new AutoChatManager(chatClient);
  await autoChatManger.initialize();
  autoChatManger.start();

  const chatHandlers = await InitializeHandlers(auth);

  chatClient.onMessage(async (channel, user, message) => {
    for (const handler of chatHandlers) {
      const response = await handler.handle(channel, message, user);
      if (response) {
        await chatClient.say(channel, response);
      }
    }
  });

  if (config.get<boolean>("event-messages.subscription.enabled")) {
    chatClient.onSub(async (channel, user, subInfo) => {
      const baseMessage = subInfo.isPrime ?
        config.get<string>("event-messages.subscription.prime")
        : config.get<string>("event-messages.subscription.paid");
      const message = replaceConfigString(baseMessage, subInfo);
      chatClient.say(channel, message);
    });
  }

  if (config.get<boolean>("event-messages.resubscription.enabled")) {
    chatClient.onResub(async (channel, user, subInfo) => {
      const baseMessage = subInfo.isPrime ?
        config.get<string>("event-messages.resubscription.prime")
        : config.get<string>("event-messages.resubscription.paid");
      const message = replaceConfigString(baseMessage, subInfo);
      await chatClient.say(channel, message);
    });
  }

  if (config.get<boolean>("event-messages.subscription-gift.enabled")) {
    chatClient.onSubGift(async (channel, user, subInfo) => {
      const baseMessage = config.get<string>("event-messages.subscription-gift.paid");
      const message = replaceGiftConfigString(baseMessage, subInfo);
      await chatClient.say(channel, message);
    });
  }
}

main();