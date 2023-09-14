const { default: axios ***REMOVED*** = require('axios');
const { Telegraf ***REMOVED*** = require('telegraf');
const { registerCommands, registerActions ***REMOVED*** = require('./core/commands/commandHandler');
const { registerRoutines ***REMOVED*** = require('./core/utils/botRoutines');
const { hiddenReplyWithRaveList ***REMOVED*** = require('./core/commands/replies');
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

// Register audio list
axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN***REMOVED***/getUpdates?offset=-1`).then(async _ => {
    // Init different lists
    await hiddenReplyWithRaveList(bot);
    // Register commands
    registerCommands(bot);
    registerActions(bot)
    registerRoutines();
    // registerMessageHandler();
    bot.launch();
***REMOVED***);



// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));