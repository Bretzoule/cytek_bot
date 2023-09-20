const fs = require("fs");
const axios = require("axios");

async function requestMeteo(ctx){
  let ville = ctx.message.text.split(" ")[1];

  let response = await axios("https://www.prevision-meteo.ch/services/json/"+ville);

  if(response.data.errors){
    ctx.reply(response.data.errors[0].text + " : " + response.data.errors[0].description);
    return -1;
  }

  fs.writeFileSync(
    `core/commands/meteoCommands/meteoContent.json`,
    JSON.stringify(response.data),
    (err) => {
      if (err) {
        console.log(err);
      }
    });
  return response.data;
};

exports.requestMeteo = requestMeteo;