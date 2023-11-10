const {
    getRaveList
***REMOVED*** = require("./ravePlanner.js");
const {
    getCYTek
***REMOVED*** = require("../cytekCommands/cytekPlanner.js");

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
        ***REMOVED***
    ***REMOVED***
***REMOVED***
        rave: selectedRave,
        timeUntilRave: timeUntilRave,
        days: Math.floor((timeUntilRave / (1000 * 60 * 60 * 24))),
        hours: Math.floor((timeUntilRave % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((timeUntilRave % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeUntilRave % (1000 * 60)) / 1000)
    ***REMOVED***
***REMOVED***

exports.timerUntilNextRave = timerUntilNextRave;