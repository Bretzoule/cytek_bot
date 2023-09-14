const cron = require("node-cron");
const { updateRaveContent ***REMOVED*** = require("../commands/raveCommands/ravePlanner");

async function registerRoutines() {
  cron.schedule("0 */2 * * *", async () => {
    await updateRaveContent();
    console.log("Rave content updated");
  ***REMOVED***);
***REMOVED***

exports.registerRoutines = registerRoutines;
