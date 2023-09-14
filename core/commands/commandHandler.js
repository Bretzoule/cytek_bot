const {
  replyWithForcedRaveUpdateStatus,
  replyWithNextCYTEK,
  replyWithCotiz,
  replyWithRaveList,
  replyWithUpdatedRaveList,
  replyWithNextRaveInList,
  updateRaveListStatus,
} = require("./replies");
const {
  commandGuard,
  toggleMaintenanceMode,
} = require("../utils/commandGuard");
const { nextRaveIndex, getRaveIndex } = require("./raveCommands/ravePlanner");

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
}

function registerActions(bot) {
  bot.action(/^goRave-(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    commandGuard(
      ctx,
      async () => await updateRaveListStatus(ctx, ctx.match[1])
    );
  });
  bot.action(/^nextRave-(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    commandGuard(ctx, async () => {
      if (ctx.match[1] != nextRaveIndex(ctx.match[1])) {
        await replyWithNextRaveInList(ctx, getRaveIndex());
      }
    });
  });
}

exports.registerCommands = registerCommands;
exports.registerActions = registerActions;
