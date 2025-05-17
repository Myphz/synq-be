import markdownEscape from "markdown-escape";
import { TELEGRAM_API_KEY, TELEGRAM_CHAT_ID } from "../constants.js";

export async function telegramLog(err: Error) {
  const {
    name = "Unknown name",
    message = "No message",
    stack = "No stack"
  } = err || {};
  let log = `*${process.env.npm_package_name || "Project with no name"} ERROR! ❌*\n *${markdownEscape(name)}*\nℹ️ *Message:* ${markdownEscape(message)}`;

  if (stack) {
    log += "```" + markdownEscape(stack.slice(0, 1084)) + "\n```";
  }

  await fetch(`https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: log,
      parse_mode: "MarkdownV2"
    })
  });
}
