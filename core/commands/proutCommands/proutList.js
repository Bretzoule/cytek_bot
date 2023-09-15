***REMOVED***
const proutsFolder = "misc/audio/prouts";
***REMOVED***
var proutsList = [];

function getProutsList() {
  return proutsList;
***REMOVED***

async function reloadProutsList() {
  try {
    const data = fs.readFileSync(`${proutsFolder***REMOVED***/proutList.json`);
    proutsList = JSON.parse(data);
  ***REMOVED*** catch (error) {
    console.log("Error while reading proutList.json");
    console.log(error);
  ***REMOVED***
***REMOVED***

async function updateProutList(ctx) {
  let fileID = ctx.update.message.reply_to_message.voice.file_id;
  let fileName = ctx.update.message.reply_to_message.voice.file_unique_id;
  let owner = ctx.update.message.reply_to_message.from.first_name ?? "";
  let date = ctx.update.message.reply_to_message.date;
  if (fileID == undefined) {
    ctx.reply("Vous devez répondre à un prout pour l'ajouter à la liste !");
    return;
  ***REMOVED***
  let url = await ctx.telegram.getFileLink(fileID);
  let response = await axios({ url, responseType: "stream" ***REMOVED***);
  return new Promise((resolve, reject) => {
    let writeStreamLocation = `${proutsFolder***REMOVED***/${fileName***REMOVED***.ogg`;
    response.data
      .pipe(fs.createWriteStream(writeStreamLocation))
      .on("finish", () => {
        getProutsList().push({
          path: writeStreamLocation,
          date: date,
          owner: owner,
        ***REMOVED***);
        fs.writeFile(
          `${proutsFolder***REMOVED***/proutList.json`,
          JSON.stringify(getProutsList()),
          function (err) {
***REMOVED***
              console.log(err);
            ***REMOVED***
            reloadProutsList();
            resolve();
          ***REMOVED***
    ***REMOVED***
      ***REMOVED***)
      .on("error", (e) => {
        console.log(e);
        reject(e);
      ***REMOVED***);
  ***REMOVED***);
***REMOVED***

exports.getProutsList = getProutsList
exports.reloadProutsList = reloadProutsList;
exports.updateProutList = updateProutList;