const fs = require("fs");
const proutsFolder = "misc/audio/prouts";
const axios = require("axios");
var proutsList = [];

function getProutsList() {
  return proutsList;
}

async function reloadProutsList() {
  try {
    const data = fs.readFileSync(`${proutsFolder}/proutList.json`);
    proutsList = JSON.parse(data);
  } catch (error) {
    console.log("Error while reading proutList.json");
    console.log(error);
  }
}

async function updateProutList(ctx) {
  let fileID = ctx.update.message.reply_to_message.voice.file_id;
  let fileName = ctx.update.message.reply_to_message.voice.file_unique_id;
  let owner = ctx.update.message.reply_to_message.from.first_name ?? "";
  let date = ctx.update.message.reply_to_message.date;
  if (fileID == undefined) {
    ctx.reply("Vous devez répondre à un prout pour l'ajouter à la liste !");
    return;
  }
  let url = await ctx.telegram.getFileLink(fileID);
  let response = await axios({ url, responseType: "stream" });
  return new Promise((resolve, reject) => {
    let writeStreamLocation = `${proutsFolder}/${fileName}.ogg`;
    response.data
      .pipe(fs.createWriteStream(writeStreamLocation))
      .on("finish", () => {
        getProutsList().push({
          path: writeStreamLocation,
          date: date,
          owner: owner,
        });
        fs.writeFile(
          `${proutsFolder}/proutList.json`,
          JSON.stringify(getProutsList()),
          function (err) {
            if (err) {
              console.log(err);
            }
            reloadProutsList();
            resolve();
          }
        );
      })
      .on("error", (e) => {
        console.log(e);
        reject(e);
      });
  });
}

exports.getProutsList = getProutsList
exports.reloadProutsList = reloadProutsList;
exports.updateProutList = updateProutList;