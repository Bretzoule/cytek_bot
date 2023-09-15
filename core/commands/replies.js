const fs = require("fs");
const {
  getRaveList,
  updateRaveList,
  reloadRaveList,
  writeToRaveFile,
  updateRaveContent,
  getRaveIndex,
} = require("./raveCommands/ravePlanner");
const { Input, Markup } = require("telegraf");
const {
  getCYTek,
  fetchCYTekContent,
  writeToCYTekFile,
} = require("./cytekCommands/cytekPlanner");
/* Init different lists */

async function hiddenReplyWithRaveList(bot) {
  if (getRaveList().length == 0) {
    await reloadRaveList(bot);
  }
  console.log(
    "Raves prévues :\n" +
      getRaveList()
        .map((rave) => rave.url)
        .join("\n")
  );
}

async function hiddenReplyWithCYTeks() {
  if (getCYTek().name == "") {
    await fetchCYTekContent();
  }
  console.log("CYTek prévue :\n" + getCYTek().name);
}

async function replyWithForcedRaveUpdateStatus(ctx) {
  try {
    await updateRaveContent();
    ctx.reply("Raves mises à jour !");
  } catch (err) {
    console.log(err);
  }
}

async function replyWithNextRaveInList(ctx, raveKey = undefined) {
  if (getRaveList().length == 0) {
    await reloadRaveList();
    console.log("Reloaded rave list");
    if (getRaveList().length == 0) {
      ctx.reply("Aucune rave prévue pour le moment.");
      return;
    }
  }
  try {
    if (getRaveList()[raveKey] == undefined) {
      raveKey =
        raveKey == undefined
          ? 0
          : getRaveList().findIndex((rave) => rave.url == raveKey);
    }
    let rave = getRaveList()[raveKey];
    await ctx.editMessageMedia({
      type: "photo",
      media: rave.image,
    });
    await ctx.editMessageCaption(
      `
  *${rave.name}*
  Rave prévue le *${new Date(rave.startDate).toLocaleString("FR-fr")}* au *${
        rave.location.name
      }* !
  Tarifs encore dispo : 
  ${rave.prices
    .map((priceDetails) => `${priceDetails.price}€ \- ${priceDetails.status}`)
    .join("\n")}
  Gens chauds : 
  ${rave.attending.map((attender) => `${attender.first_name}`).join("\n")}`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url("🔗", rave.url),
          Markup.button.url("📍", rave.location.url),
          Markup.button.callback("⏭️", `nextRave-${raveKey}`),
          Markup.button.callback("✅/⛔", `goRave-${raveKey}`),
        ]).resize(),
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function updateRaveListStatus(ctx, raveIndex) {
  try {
    let rave = getRaveList()[raveIndex];
    let attender = rave.attending.find(
      (attender) => attender.id == ctx.from.id
    );
    if (attender != null) {
      rave.attending.splice(rave.attending.indexOf(attender), 1);
    } else {
      ctx.answerCbQuery(`Hate de te voir à la rave ${ctx.from.first_name}`);
      rave.attending.push({
        id: ctx.from.id,
        first_name: ctx.from.first_name,
      });
    }
    await writeToRaveFile(ctx);
    await ctx.editMessageCaption(
      `
*${rave.name}*
Rave prévue le *${new Date(rave.startDate).toLocaleString("FR-fr")}* au *${
        rave.location.name
      }* !
Tarifs encore dispo : 
${rave.prices
  .map((priceDetails) => `${priceDetails.price}€ \- ${priceDetails.status}`)
  .join("\n")}
Gens chauds : 
${rave.attending.map((attender) => `${attender.first_name}`).join("\n")}`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url("🔗", rave.url),
          Markup.button.url("📍", rave.location.url),
          Markup.button.callback("⏭️", `nextRave-${raveIndex}`),
          Markup.button.callback("✅/⛔", `goRave-${raveIndex}`),
        ]).resize(),
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function replyWithCotiz(ctx) {
  try {
    await ctx.replyWithPhoto(
      Input.fromLocalFile("misc/images/cytek/logo_cytek.jpg"),
      {
        caption: `
*LISEZ LE MAIL POUR ACCÉDER AU CHANNEL COTISANT !*

Vous pouvez adhérer à cette superbe association en cliquant sur le bouton ci-dessous !
Adhérer vous permettra d’avoir accès en avant-première aux billetteries de nos events (_et ça va partir vite_) 😍️
⚠️ Attention, HelloAsso peut vous demander un don, *CE N’EST PAS OBLIGATOIRE* !! 
Vous pouvez l’enlever en cliquant sur 'Modifier —> Ne pas faire de don'

with Love ❤️, CY TEK
  `,
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url(
            "🔗 => 💸",
            "https://www.helloasso.com/associations/cy-tek/adhesions/cotisation-cytek-23-24"
          ),
        ]).resize(),
      }
    );
  } catch (error) {
    console.log(error);
    ctx.reply("Je ne peux pas envoyer de rave pour le moment.");
  }
}

async function replyWithRaveList(ctx, raveKey = undefined) {
  if (getRaveList().length == 0) {
    await reloadRaveList();
    console.log("Reloaded rave list");
    if (getRaveList().length == 0) {
      ctx.reply("Aucune rave prévue pour le moment.");
      return;
    }
  }
  try {
    if (getRaveList()[raveKey] == undefined) {
      raveKey =
        raveKey == undefined
          ? 0
          : getRaveList().findIndex((rave) => rave.url == raveKey);
    }
    let rave = getRaveList()[raveKey];
    await ctx.replyWithPhoto(Input.fromURL(rave.image), {
      caption: `
*${rave.name}*
Rave prévue le *${new Date(rave.startDate).toLocaleString("FR-fr")}* au *${
        rave.location.name
      }* !
Tarifs encore dispo : 
${rave.prices
  .map((priceDetails) => `${priceDetails.price}€ \- ${priceDetails.status}`)
  .join("\n")}
Gens chauds : 
${rave.attending.map((attender) => `${attender.first_name}`).join("\n")}`,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.url("🔗", rave.url),
        Markup.button.url("📍", rave.location.url),
        Markup.button.callback("⏭️", `nextRave-${raveKey}`),
        Markup.button.callback("✅/⛔", `goRave-${raveKey}`),
      ]).resize(),
    });
  } catch (error) {
    console.log(error);
    ctx.reply("Je ne peux pas envoyer de rave pour le moment.");
  }
}

async function replyWithUpdatedRaveList(ctx, remove = false) {
  try {
    let raveKey = ctx.message.text.split(" ")[1];
    raveKey = await updateRaveList(ctx, raveKey, remove);
    if (!remove && raveKey) replyWithRaveList(ctx, raveKey);
  } catch (error) {
    console.log(error);
  }
}

async function updateCYTekStatus(ctx) {
  try {
    let cytek = getCYTek();
    let attender = cytek.attending.find(
      (attender) => attender.id == ctx.from.id
    );
    if (attender != null) {
      cytek.attending.splice(cytek.attending.indexOf(attender), 1);
    } else {
      ctx.answerCbQuery(`Hate de te voir à la rave ${ctx.from.first_name}`);
      cytek.attending.push({
        id: ctx.from.id,
        first_name: ctx.from.first_name,
      });
    }
    await writeToCYTekFile(ctx);
    await ctx.editMessageCaption(
      `
*${cytek.name}*
CYTEK prévue le *${new Date(cytek.startDate).toLocaleString("FR-fr")}*
${cytek.description}
Billeterie dispooo :
${cytek.prices
  .map(
    (priceDetails) =>
      `${priceDetails.price}€ \- ${priceDetails.type} \- ${priceDetails.status}`
  )
  .join("\n")}
Gens chauds : 
${cytek.attending.map((attender) => `${attender.first_name}`).join("\n")}`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url("🔗", cytek.url),
          Markup.button.url("📍", cytek.location.url),
          Markup.button.callback("✅/⛔", `goCYTek`),
        ]).resize(),
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function replyWithNextCYTEK(ctx) {
  if (getCYTek().name == "") {
    await fetchCYTekContent();
    console.log("Reloaded CY TEK content");
    if (getCYTek().name == "") {
      ctx.reply("Aucune CYTek prévue pour le moment.");
      return;
    }
  }
  let cytek = getCYTek();
  try {
    await ctx.replyWithPhoto(Input.fromLocalFile(cytek.image), {
      caption: `
*${cytek.name}*
CYTEK prévue le *${new Date(cytek.startDate).toLocaleString("FR-fr")}*
${cytek.description}
Billeterie dispooo :
${cytek.prices
  .map(
    (priceDetails) =>
      `${priceDetails.price}€ \- ${priceDetails.type} \- ${priceDetails.status}`
  )
  .join("\n")}
Gens chauds : 
${cytek.attending.map((attender) => `${attender.first_name}`).join("\n")}`,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.url("🔗", cytek.url),
        Markup.button.url("📍", cytek.location.url),
        Markup.button.callback("✅/⛔", `goCYTek`),
      ]).resize(),
    });
  } catch (error) {
    console.log(error);
    ctx.reply("Je ne peux pas envoyer de rave pour le moment.");
  }
}

exports.hiddenReplyWithRaveList = hiddenReplyWithRaveList;
exports.replyWithRaveList = replyWithRaveList;
exports.replyWithUpdatedRaveList = replyWithUpdatedRaveList;
exports.updateRaveListStatus = updateRaveListStatus;
exports.replyWithForcedRaveUpdateStatus = replyWithForcedRaveUpdateStatus;
exports.replyWithCotiz = replyWithCotiz;
exports.replyWithNextCYTEK = replyWithNextCYTEK;
exports.replyWithNextRaveInList = replyWithNextRaveInList;
exports.replyWithNextCYTEK = replyWithNextCYTEK;
exports.updateCYTekStatus = updateCYTekStatus;
exports.hiddenReplyWithCYTeks = hiddenReplyWithCYTeks