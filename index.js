const { default: axios } = require("axios");
const { Telegraf } = require("telegraf");
const {
  registerCommands,
  registerActions,
} = require("./core/commands/commandHandler");
const { registerRoutines } = require("./core/utils/botRoutines");
const {
  hiddenReplyWithRaveList,
  hiddenReplyWithCYTeks,
  hiddenReplyWithProutList,
} = require("./core/commands/replies");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Register audio list
axios
  .get(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUpdates?offset=-1`
  )
  .then(async (_) => {
    // Init different lists
    await hiddenReplyWithRaveList(bot);
    await hiddenReplyWithProutList(bot)
    await hiddenReplyWithCYTeks();
    // Register commands
    registerCommands(bot);
    registerActions(bot);
    registerRoutines();
    // registerMessageHandler();
    bot.launch();
  });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
