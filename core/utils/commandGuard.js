const allowedList = require("./allowedList.json");
var maintenanceMode = false;
const usersMap = new Map();
const throttle = throttler(1);

function throttler(waitTime) {
  return (chatId) => {
    const now = parseInt(Date.now() / 1000);
    const hitTime = usersMap.get(chatId);
    if (hitTime) {
      const diff = now - hitTime;
      if (diff < waitTime) {
        return false;
      ***REMOVED***
      usersMap.set(chatId, now);
      return true;
    ***REMOVED***
    usersMap.set(chatId, now);
    return true;
  ***REMOVED***;
***REMOVED***

function toggleMaintenanceMode() {
  maintenanceMode = !maintenanceMode;
  console.log(`Maintenance mode is now ${maintenanceMode***REMOVED***`);
***REMOVED***

async function commandGuard(ctx, callback, adminRequired = false) {
  if (
    !maintenanceMode ||
    allowedList.admins.includes(ctx.update.message?.from.id ?? ctx.update.callback_query.message.chat.id)
  ) {
    // if(await ctx.telegram.getUserProfilePhotos(ctx.from.id).total_count == 0) {
    //   ctx.reply("Tu as besoin d'une photo de profil pour utiliser ce bot.");
    //   return;
    // ***REMOVED***
    if (
        ctx.update.callback_query?.message != undefined || 
      (ctx.update.message.chat.type == "private" &&
        allowedList.users.includes(ctx.update.message.from.id)) ||
        // getUserProfilePhotos(ctx.update.message.from.id).photos != [] ||
      ((ctx.update.message.chat.type == "group" ||
        ctx.update.message.chat.type == "supergroup") &&
        allowedList.groups.includes(ctx.update.message.chat.id))
    ) {
      if (
        !adminRequired ||
        allowedList.admins.includes(ctx.update.message?.from.id ?? ctx.update.callback_query.message.chat.id)
      ) {
        if (throttle(ctx.update.message?.chat.id ?? ctx.update.callback_query.message.chat.id)) {
          await callback();
        ***REMOVED***
      ***REMOVED***
    ***REMOVED*** else {
      console.log(ctx.update.message);
    ***REMOVED***
  ***REMOVED***
***REMOVED***

exports.toggleMaintenanceMode = toggleMaintenanceMode;
exports.commandGuard = commandGuard;
