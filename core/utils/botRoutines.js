const cron = require("node-cron");
const { updateRaveContent } = require("../commands/raveCommands/ravePlanner");

async function registerRoutines() {
  cron.schedule("0 */2 * * *", async () => {
    await updateRaveContent();
    console.log("Rave content updated");
  });
}

exports.registerRoutines = registerRoutines;
