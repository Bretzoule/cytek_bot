const {
  replyWithForcedRaveUpdateStatus,
  replyWithNextCYTEK,
  replyWithCotiz,
  replyWithRaveList,
  replyWithUpdatedRaveList,
  replyWithNextRaveInList,
  updateRaveListStatus,
***REMOVED*** = require("./replies");
const {
  commandGuard,
  toggleMaintenanceMode,
***REMOVED*** = require("../utils/commandGuard");
const { nextRaveIndex, getRaveIndex ***REMOVED*** = require("./raveCommands/ravePlanner");

function registerCommands(bot) {
  bot.command("addRave", (ctx) =>
    commandGuard(
      ctx,
      () => replyWithUpdatedRaveList(ctx),
      (adminRequired = true)
    )
  );
  bot.command("maintenanceMode", (ctx) =>
    commandGuard(ctx, () => toggleMaintenanceMode(), (adminRequired = true))
  );
  bot.command("removeRave", (ctx) =>
    commandGuard(ctx, () => replyWithUpdatedRaveList(ctx, (remove = true)))
  );
  bot.command("cytek", (ctx) =>
    commandGuard(ctx, () => replyWithNextCYTEK(ctx))
  );
  bot.command("rave", (ctx) => commandGuard(ctx, () => replyWithRaveList(ctx)));
  bot.command("cotiz", (ctx) => commandGuard(ctx, () => replyWithCotiz(ctx)));
  bot.command("forceUpdateRaves", (ctx) =>
    commandGuard(
      ctx,
      () => replyWithForcedRaveUpdateStatus(ctx),
      (adminRequired = true)
    )
  );
***REMOVED***

function registerActions(bot) {
  bot.action(/^goRave-(\d+)$/, async (ctx) => {
***REMOVED***
      await ctx.answerCbQuery();
      commandGuard(
        ctx,
        async () => await updateRaveListStatus(ctx, ctx.match[1])
  ***REMOVED***
    ***REMOVED*** catch (error) {
      console.log(error);
    ***REMOVED***
  ***REMOVED***);
  bot.action(/^nextRave-(\d+)$/, async (ctx) => {
***REMOVED***
      await ctx.answerCbQuery();
      commandGuard(ctx, async () => {
        if (ctx.match[1] != nextRaveIndex(ctx.match[1])) {
          await replyWithNextRaveInList(ctx, getRaveIndex());
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED*** catch (error) {
      console.log(error);
    ***REMOVED***
  ***REMOVED***);
***REMOVED***

exports.registerCommands = registerCommands;
exports.registerActions = registerActions;
