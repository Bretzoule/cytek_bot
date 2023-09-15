const {
  replyWithForcedRaveUpdateStatus,
  replyWithNextCYTEK,
  replyWithCotiz,
  replyWithRaveList,
  replyWithUpdatedRaveList,
  replyWithNextRaveInList,
  updateRaveListStatus,
  replyWithProut,
  replyWithUpdatedProutList,
  updateCYTekStatus,
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
  bot.command("cytek", (ctx) =>
    commandGuard(ctx, () => replyWithNextCYTEK(ctx))
  );
  bot.command("prout", (ctx) => commandGuard(ctx, () => replyWithProut(ctx)));
  bot.command("addProut", (ctx) =>
    commandGuard(
      ctx,
      () => replyWithUpdatedProutList(ctx),
      (adminRequired = true)
    )
  );
}

function registerActions(bot) {
  bot.action(/^goRave-(\d+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      commandGuard(
        ctx,
        async () => await updateRaveListStatus(ctx, ctx.match[1])
      );
    } catch (error) {
      console.log(error);
    }
  });
  bot.action("goCYTek", async (ctx) => {
    try {
      await ctx.answerCbQuery();
      commandGuard(ctx, async () => await updateCYTekStatus(ctx));
    } catch (error) {
      console.log(error);
    }
  });
  bot.action(/^nextRave-(\d+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      commandGuard(ctx, async () => {
        if (ctx.match[1] != nextRaveIndex(ctx.match[1])) {
          await replyWithNextRaveInList(ctx, getRaveIndex());
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
}

exports.registerCommands = registerCommands;
exports.registerActions = registerActions;
