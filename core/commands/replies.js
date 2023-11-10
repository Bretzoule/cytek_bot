***REMOVED***
const {
  getRaveList,
  updateRaveList,
  reloadRaveList,
  writeToRaveFile,
  updateRaveContent,
  getRaveIndex,
  removeOldRaves
***REMOVED*** = require("./raveCommands/ravePlanner");
const {
  timerUntilNextRave
***REMOVED*** = require("./raveCommands/viteMaDose");
const {
  getProutsList,
  reloadProutsList,
  updateProutList
***REMOVED*** = require("./proutCommands/proutList");
const { Input, Markup ***REMOVED*** = require("telegraf");
const {
  getCYTek,
  fetchCYTekContent,
  writeToCYTekFile,
***REMOVED*** = require("./cytekCommands/cytekPlanner");
/* Init different lists */

async function hiddenReplyWithProutList(bot) {
  if (getProutsList().length == 0) {
    await reloadProutsList(bot);
  ***REMOVED***
  console.log(
    "Liste des prouts disponibles:\n" +
      getProutsList()
        .map((prout) => prout.path)
        .join("\n")
  );
***REMOVED***

async function replyWithUpdatedProutList(ctx) {
  try {
    await updateProutList(ctx);
    ctx.reply("Merci pour ce nouveau prout !");
  ***REMOVED*** catch (err) {
    console.log(err);
  ***REMOVED***
***REMOVED***

async function replyWithProut(ctx) {
  if (getProutsList().length == 0) return;
  try {
    let proutSample =
      getProutsList()[Math.floor(Math.random() * getProutsList().length)];
    let audio = Input.fromLocalFile(proutSample.path);
    await ctx.replyWithAudio(audio, {
      caption: `
Prouté par : ${proutSample.owner***REMOVED***, le ${new Date(
        proutSample.date * 1000
      ).toLocaleString("FR-fr")***REMOVED***`,
    ***REMOVED***);
  ***REMOVED*** catch (error) {
    console.log(error);
    ctx.reply("Je ne peux pas envoyer de prout pour le moment.");
  ***REMOVED***
***REMOVED***

async function hiddenReplyWithRaveList(bot) {
  if (getRaveList().length == 0) {
    await reloadRaveList(bot);
  ***REMOVED***
  console.log(
    "Raves prévues :\n" +
      getRaveList()
        .map((rave) => rave.url)
        .join("\n")
  );
***REMOVED***

async function hiddenReplyWithCYTeks() {
  if (getCYTek().name == "") {
    await fetchCYTekContent();
  ***REMOVED***
  console.log("CYTek prévue :\n" + getCYTek().name);
***REMOVED***

async function replyWithForcedRaveUpdateStatus(ctx) {
  try {
***REMOVED***
    await updateRaveContent();
    ctx.reply("Raves mises à jour !");
  ***REMOVED*** catch (err) {
    console.log(err);
  ***REMOVED***
***REMOVED***

async function replyWithNextRaveInList(ctx, raveKey = undefined) {
  if (getRaveList().length == 0) {
    await reloadRaveList();
    console.log("Reloaded rave list");
    if (getRaveList().length == 0) {
      ctx.reply("Aucune rave prévue pour le moment.");
      return;
    ***REMOVED***
  ***REMOVED***
  try {
    if (getRaveList()[raveKey] == undefined) {
      raveKey =
        raveKey == undefined
          ? 0
          : getRaveList().findIndex((rave) => rave.url == raveKey);
    ***REMOVED***
    let rave = getRaveList()[raveKey];
    await ctx.editMessageMedia({
      type: "photo",
      media: rave.image,
    ***REMOVED***);
    await ctx.editMessageCaption(
      `
  *${rave.name***REMOVED****
  Rave prévue le *${new Date(rave.startDate).toLocaleString("FR-fr")***REMOVED**** au *${
        rave.location.name
      ***REMOVED**** !
  Tarifs encore dispo : 
  ${rave.prices
    .map((priceDetails) => `${priceDetails.price***REMOVED***€ \- ${priceDetails.status***REMOVED***`)
    .join("\n")***REMOVED***
  Gens chauds : 
  ${rave.attending.map((attender) => `${attender.first_name***REMOVED***`).join("\n")***REMOVED***`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url("🔗", rave.url),
          Markup.button.url("📍", rave.location.url),
          Markup.button.callback("⏭️", `nextRave-${raveKey***REMOVED***`),
          Markup.button.callback("✅/⛔", `goRave-${raveKey***REMOVED***`),
        ]).resize(),
      ***REMOVED***
***REMOVED***
  ***REMOVED*** catch (err) {
    console.log(err);
  ***REMOVED***
***REMOVED***

async function updateRaveListStatus(ctx, raveIndex) {
  try {
    let rave = getRaveList()[raveIndex];
    let attender = rave.attending.find(
      (attender) => attender.id == ctx.from.id
***REMOVED***
    if (attender != null) {
      rave.attending.splice(rave.attending.indexOf(attender), 1);
    ***REMOVED*** else {
      ctx.answerCbQuery(`Hate de te voir à la rave ${ctx.from.first_name***REMOVED***`);
      rave.attending.push({
        id: ctx.from.id,
        first_name: ctx.from.first_name,
      ***REMOVED***);
    ***REMOVED***
    await writeToRaveFile(ctx);
    await ctx.editMessageCaption(
      `
*${rave.name***REMOVED****
Rave prévue le *${new Date(rave.startDate).toLocaleString("FR-fr")***REMOVED**** au *${
        rave.location.name
      ***REMOVED**** !
Tarifs encore dispo : 
${rave.prices
  .map((priceDetails) => `${priceDetails.price***REMOVED***€ \- ${priceDetails.status***REMOVED***`)
  .join("\n")***REMOVED***
Gens chauds : 
${rave.attending.map((attender) => `${attender.first_name***REMOVED***`).join("\n")***REMOVED***`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url("🔗", rave.url),
          Markup.button.url("📍", rave.location.url),
          Markup.button.callback("⏭️", `nextRave-${raveIndex***REMOVED***`),
          Markup.button.callback("✅/⛔", `goRave-${raveIndex***REMOVED***`),
        ]).resize(),
      ***REMOVED***
***REMOVED***
  ***REMOVED*** catch (err) {
    console.log(err);
  ***REMOVED***
***REMOVED***

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
  ***REMOVED***
        ]).resize(),
      ***REMOVED***
***REMOVED***
  ***REMOVED*** catch (error) {
    console.log(error);
    ctx.reply("Je ne peux pas envoyer de rave pour le moment.");
  ***REMOVED***
***REMOVED***

async function replyWithRaveList(ctx, raveKey = undefined) {
  if (getRaveList().length == 0) {
    await reloadRaveList();
    console.log("Reloaded rave list");
    if (getRaveList().length == 0) {
      ctx.reply("Aucune rave prévue pour le moment.");
      return;
    ***REMOVED***
  ***REMOVED***
  try {
    if (getRaveList()[raveKey] == undefined) {
      raveKey =
        raveKey == undefined
          ? 0
          : getRaveList().findIndex((rave) => rave.url == raveKey);
    ***REMOVED***
    let rave = getRaveList()[raveKey];
    await ctx.replyWithPhoto(Input.fromURL(rave.image), {
      caption: `
*${rave.name***REMOVED****
Rave prévue le *${new Date(rave.startDate).toLocaleString("FR-fr")***REMOVED**** au *${
        rave.location.name
      ***REMOVED**** !
Tarifs encore dispo : 
${rave.prices
  .map((priceDetails) => `${priceDetails.price***REMOVED***€ \- ${priceDetails.status***REMOVED***`)
  .join("\n")***REMOVED***
Gens chauds : 
${rave.attending.map((attender) => `${attender.first_name***REMOVED***`).join("\n")***REMOVED***`,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.url("🔗", rave.url),
        Markup.button.url("📍", rave.location.url),
        Markup.button.callback("⏭️", `nextRave-${raveKey***REMOVED***`),
        Markup.button.callback("✅/⛔", `goRave-${raveKey***REMOVED***`),
      ]).resize(),
    ***REMOVED***);
  ***REMOVED*** catch (error) {
    console.log(error);
    ctx.reply("Je ne peux pas envoyer de rave pour le moment.");
  ***REMOVED***
***REMOVED***

async function replyWithUpdatedRaveList(ctx, remove = false) {
  try {
    let raveKey = ctx.message.text.split(" ")[1];
    raveKey = await updateRaveList(ctx, raveKey, remove);
    if (!remove && raveKey) replyWithRaveList(ctx, raveKey);
  ***REMOVED*** catch (error) {
    console.log(error);
  ***REMOVED***
***REMOVED***

async function updateCYTekStatus(ctx) {
  try {
    let cytek = getCYTek();
    let attender = cytek.attending.find(
      (attender) => attender.id == ctx.from.id
***REMOVED***
    if (attender != null) {
      cytek.attending.splice(cytek.attending.indexOf(attender), 1);
    ***REMOVED*** else {
      ctx.answerCbQuery(`Hate de te voir à la rave ${ctx.from.first_name***REMOVED***`);
      cytek.attending.push({
        id: ctx.from.id,
        first_name: ctx.from.first_name,
      ***REMOVED***);
    ***REMOVED***
    await writeToCYTekFile(ctx);
    await ctx.editMessageCaption(
      `
*${cytek.name***REMOVED****
CYTEK prévue le *${new Date(cytek.startDate).toLocaleString("FR-fr")***REMOVED****
${cytek.description***REMOVED***
Billeterie dispooo :
${cytek.prices
  .map(
    (priceDetails) =>
      `${priceDetails.price***REMOVED***€ \- ${priceDetails.type***REMOVED*** \- ${priceDetails.status***REMOVED***`
  )
  .join("\n")***REMOVED***
Gens chauds : 
${cytek.attending.map((attender) => `${attender.first_name***REMOVED***`).join("\n")***REMOVED***`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.url("🔗", cytek.url),
          Markup.button.url("📍", cytek.location.url),
          Markup.button.callback("✅/⛔", `goCYTek`),
        ]).resize(),
      ***REMOVED***
***REMOVED***
  ***REMOVED*** catch (error) {
    console.log(error);
  ***REMOVED***
***REMOVED***

async function replyWithNextCYTEK(ctx) {
  if (getCYTek().name == "") {
    await fetchCYTekContent();
    console.log("Reloaded CY TEK content");
    if (getCYTek().name == "") {
      ctx.reply("Aucune CYTek prévue pour le moment.");
      return;
    ***REMOVED***
  ***REMOVED***
  let cytek = getCYTek();
  try {
    await ctx.replyWithPhoto(Input.fromLocalFile(cytek.image), {
      caption: `
*${cytek.name***REMOVED****
CYTEK prévue le *${new Date(cytek.startDate).toLocaleString("FR-fr")***REMOVED****
${cytek.description***REMOVED***
Billeterie dispooo :
${cytek.prices
  .map(
    (priceDetails) =>
      `${priceDetails.price***REMOVED***€ \- ${priceDetails.type***REMOVED*** \- ${priceDetails.status***REMOVED***`
  )
  .join("\n")***REMOVED***
Gens chauds : 
${cytek.attending.map((attender) => `${attender.first_name***REMOVED***`).join("\n")***REMOVED***`,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.url("🔗", cytek.url),
        Markup.button.url("📍", cytek.location.url),
        Markup.button.callback("✅/⛔", `goCYTek`),
      ]).resize(),
    ***REMOVED***);
  ***REMOVED*** catch (error) {
    console.log(error);
    ctx.reply("Je ne peux pas envoyer de rave pour le moment.");
  ***REMOVED***
***REMOVED***

async function replyWithNextRaveTimer(ctx) {
  let nextRaveTimer = timerUntilNextRave();
  if (nextRaveTimer.rave == null) {
      ctx.reply({ text: "Aucune rave de prévue ! *VITE MA DOSEEEEEEE AAAAH !*", parse_mode: "Markdown" ***REMOVED***);
  ***REMOVED*** else {
      ctx.reply(
          {
              text:
                  `🎉 Prochaine rave dans 🎉 :
*${nextRaveTimer.days***REMOVED**** jours, *${nextRaveTimer.hours***REMOVED**** heures, *${nextRaveTimer.minutes***REMOVED**** minutes et *${nextRaveTimer.seconds***REMOVED**** secondes 
------------------------------------
*${nextRaveTimer.rave.name***REMOVED****`
              , parse_mode: "Markdown",
          ***REMOVED***);
  ***REMOVED***
***REMOVED***

exports.replyWithNextRaveTimer = replyWithNextRaveTimer
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
exports.hiddenReplyWithCYTeks = hiddenReplyWithCYTeks;
exports.replyWithProut = replyWithProut;
exports.replyWithUpdatedProutList = replyWithUpdatedProutList;
exports.hiddenReplyWithProutList = hiddenReplyWithProutList;