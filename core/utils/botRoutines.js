const cron = require("node-cron");
const { updateRaveContent } = require("../commands/raveCommands/ravePlanner");

async function registerRoutines(bot) {
  cron.schedule("0 */2 * * *", async () => {
    await updateRaveContent(bot);
    console.log("Rave content updated");
  });
}

exports.registerRoutines = registerRoutines;
