const {
    getRaveList
} = require("./ravePlanner.js");
const {
    getCYTek
} = require("../cytekCommands/cytekPlanner.js");

function timerUntilNextRave() {
    let date = new Date();
    let raveList = getRaveList().concat(getCYTek());
    let selectedRave = null;
    let timeUntilRave = -1
    for (let rave of raveList) {
        let raveDate = new Date(rave.startDate);
        let tmpTimeUntilRave = raveDate - date;
        if (tmpTimeUntilRave > 0 && (timeUntilRave == -1 || tmpTimeUntilRave < timeUntilRave)) {
            timeUntilRave = raveDate - date
            selectedRave = rave;
        }
    }
    return {
        rave: selectedRave,
        timeUntilRave: timeUntilRave,
        days: Math.floor((timeUntilRave / (1000 * 60 * 60 * 24))),
        hours: Math.floor((timeUntilRave % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((timeUntilRave % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeUntilRave % (1000 * 60)) / 1000)
    }
}

exports.timerUntilNextRave = timerUntilNextRave;