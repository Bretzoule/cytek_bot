const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
var raveList = [];
var raveIndex = 0;
const maxTarifNameSize = 22;
var informRaveChange = true;
const CYTEKChatID = process.env.CYTEKChatID;

function getRaveList() {
    return raveList;
}

function getRaveIndex() {
    return raveIndex;
}

function nextRaveIndex() {
    raveIndex = (raveIndex + 1) % raveList.length;
    return raveIndex;
}

async function reloadRaveList() {
    try {
        const data = fs.readFileSync(`core/commands/raveCommands/ravePlanner.json`);
        raveList = JSON.parse(data);
    } catch (error) {
        console.log("Error while reading ravePlanner.json");
        console.log(error);
    }
}

async function writeToRaveFile() {
    fs.writeFileSync(
        `core/commands/raveCommands/ravePlanner.json`,
        JSON.stringify(raveList),
        async function (err) {
            if (err) {
                console.log(err);
            }
            await reloadRaveList();
        }
    );
}

function translateAvailability(availability) {
    availability = availability.replace("https://schema.org/", "");
    switch (availability) {
        case "InStock":
            return "Disponible";
        case "LimitedAvailability":
            return "Bientôt épuisé";
        default:
            return "Non disponible";
    }
}

async function removeOldRaves() {
    let currentDate = new Date();
    let raveChanged = false;
    let raves = getRaveList();
    for (let i = 0; i < raves.length; i++) {
        let raveDate = new Date(raves[i].startDate);
        if (raveDate < currentDate) {
            raves.splice(i, 1);
            i--;
            raveChanged = true;
        }
    }
    if (raveChanged) {
        console.log("Removed old raves");
        await writeToRaveFile();
    }
}

async function requestShotgun(raveKeyURL) {
    let response = await axios(raveKeyURL);
    // if (response.request.res.responseUrl != raveKeyURL) {
    //     let tmpResponse = await axios(response.request.res.responseUrl);
    //     newURL = tmpResponse.data.match(/window\.top\.location = (validateProtocol\(("https:\/\/.*?)"{1})/)[0];
    //     newURL = newURL.replace("window.top.location = validateProtocol(", "");
    //     newURL = newURL.replace(/"/g, "");
    //     response = await axios(newURL);
    // }
    return response;
}

async function requestDice(raveKeyURL) {
    return await axios(raveKeyURL, {
        withCredentials: true, headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cookie': '__cf_bm=aPApYKHyVnY2dAA5FEw8qCdSuRqFhP4rJZL_m7C3tKQ-1709597480-1.0.1.1-BmtLk8QKiCsBUBqm4oaEi7dr0aB2BV8KY.VMnCMF7ueClAS0ezFZedhAHbH28Imc1OKGeuPFpTq682G6brjfmw;cf_clearance:SwEGp2yeaJwaUhgnMnYFh1dxxNVE1XdMmkH5SOYn7wA-1709597481-1.0.1.1-eoP0JrquZXDVfVHL4eHQbnF7.kCLTgrHqN1KafIXVVIkMAiNGanVvHT544whg5GFpKGwGZ8cYzF2UpVdQgFP2w'

        }
    });
}

async function notifyForPriceChange(oldRave, newRave, bot) {
    let leftTarifications = newRave.prices.filter(offer => oldRave.prices.some(newOffer => newOffer.price != offer.price));
    if (leftTarifications.length > 0) {
        let message = `Aïe, on a détecté un changement de tarot : \n\nLes tarifs restants pour l'évent ${oldRave.name} sont :\n`;
        leftTarifications.forEach(price => {
            message += `${price.name.length > maxTarifNameSize ?
                price.name.substring(0, maxTarifNameSize - 3) + "..." :
                price.name} : ${price.status} - ${price.price}€\n`;
        });
        message += `\n\nNe tarde pas à prendre ta place !`;
        if (informRaveChange) {
            console.log(bot);
            await bot.telegram.sendMessage(CYTEKChatID, message)
        }
        else {
            console.log("InformRaveChange is set to false, not sending message to channel \n\n" + message);
        }
    }
}

function setInformRaveChange() {
    informRaveChange = !informRaveChange;
    return informRaveChange;
}

async function updateRaveContent(bot) {
    await removeOldRaves();
    let raves = getRaveList();
    let raveChanged = false;
    let shotgunRave = false;
    for (let i = 0; i < raves.length; i++) {
        let event = {};
        if (raves[i].url.startsWith("https://dice.fm")) {
            let response = await requestDice(raves[i].url)
            let content = getContent(response.data);
            event = createDiceEvent(content, raves[i].attending);
        } else {
            let response = await requestShotgun(raves[i].url)
            let content = getContent(response.data);
            event = createShotgunEvent(content, raves[i].attending);
            shotgunRave = true;
        }
        if (JSON.stringify(event) != JSON.stringify(raves[i])) {
            raves[i] = event;
            raveChanged = true;
            if (shotgunRave) notifyForPriceChange(raves[i], event, bot);
        }
    }
    if (raveChanged) {
        console.log("Raves updated with new content");
        await writeToRaveFile();
    }
}

async function removeSelectedRave(ctx) {
    let raveUrl = ctx.update.message.text.split(" ")[1];
    raveUrl = raveUrl.split("/")[3];
    for (let i = 0; i < raveList.length; i++) {
        ;
        if (raveList[i].url.includes(raveUrl)) {
            let raveName = raveList[i].name;
            raveList.splice(i, 1);
            await writeToRaveFile();
            ctx.reply("Rave supprimée avec succès : " + raveName);
            return;
        }
    }
    ctx.reply("Rave non trouvée - NB: vous devez utiliser l'url de la rave pour la supprimer !");
}

function getContent(responseData) {
    const $ = cheerio.load(responseData);
    let scriptList = $("script").get();
    for (const scriptus of scriptList) {
        if ($(scriptus).text().includes('"@type":"MusicEvent"')) {
            return JSON.parse($(scriptus).text());
        }
    }
    return null;
}

function createShotgunEvent(shotgunEvent, attendingList = []) {
    let url = "https://maps.google.fr"
    if (shotgunEvent.location.name != null && shotgunEvent.location.geo != null) {
        url = `https://www.google.com/maps/search/${shotgunEvent.location.name} ${shotgunEvent.location.address.streetAddress}/@${shotgunEvent.location.geo.latitude},${shotgunEvent.location.geo.longitude}`
    }
    return {
        name: shotgunEvent.name.replace(/&amp;/g, '&'),
        description: shotgunEvent.description.replace(/&amp;/g, '&').substring(0, 100) + "..." ?? "Pas de description",
        startDate: `${shotgunEvent.startDate}`,
        endDate: `${shotgunEvent.endDate}`,
        image: shotgunEvent.image[0] != 'h' ? shotgunEvent.image[0] : shotgunEvent.image,
        url: shotgunEvent.url,
        location: {
            name: shotgunEvent.location.name ?? "Lieu non renseigné",
            address: shotgunEvent.location.address.streetAddress ?? "Lieu non renseigné",
            url: url
        },
        prices: shotgunEvent.offers.filter(offer => offer.availability != "https://schema.org/SoldOut").map(offer => {
            return {
                price: offer.price,
                name: offer.name,
                status: translateAvailability(offer.availability),
            }
        }
        ),
        attending: attendingList,
    }
}

function createDiceEvent(diceEvent, attendingList = []) {
    let url = "https://maps.google.fr"
    if (diceEvent.location.name != null && diceEvent.location.geo != null) {
        url = `https://www.google.com/maps/search/${diceEvent.location.name} ${diceEvent.location.address}/@${diceEvent.location.geo.latitude},${diceEvent.location.geo.longitude}`
    }
    return {
        name: diceEvent.name.replace(/&amp;/g, '&'),
        description: diceEvent.description.replace(/&amp;/g, '&').substring(0, 100) + "..." ?? "Pas de description",
        startDate: `${diceEvent.startDate}`,
        endDate: `${diceEvent.endDate}`,
        image: decodeURIComponent(JSON.parse(diceEvent.image[0])),
        url: decodeURIComponent(JSON.parse(diceEvent.url)),
        location: {
            name: diceEvent.location.name ?? "Lieu non renseigné",
            address: diceEvent.location.address ?? "Lieu non renseigné",
            url: url
        },
        prices: diceEvent.offers.filter(offer => decodeURIComponent(JSON.parse(offer.availability)) != "https://schema.org/SoldOut").map(offer => {
            return {
                price: offer.price,
                name: offer.name,
                status: translateAvailability(decodeURIComponent(JSON.parse(offer.availability))),
            }
        }
        ),
        attending: attendingList,
    }
}

async function diceRave(raveKeyURL) {
    if (raveKeyURL == undefined || !raveKeyURL.match("https://dice.fm/event/.*")) {
        ctx.reply("Vous devez renseigner un lien Dice valide pour ajouter une rave !");
        throw "Invalid Dice URL";
    }
    let response = await requestDice(raveKeyURL);
    let diceEvent = getContent(response.data);
    if (diceEvent == null) {
        ctx.reply("Le lien Dice que vous avez renseigné n'est pas valide !");
        throw "Invalid Dice URL";
    }
    let event = createShotgunEvent(diceEvent);
    if (raveList.some(existingRave => existingRave.name === event.name)) {
        ctx.reply("L'évenement existe déjà dans la liste des raves !");
        throw "Event already exists";
    }
    return event;
}

async function shotgunRave(ctx, raveKeyURL) {
    if (raveKeyURL == undefined || !raveKeyURL.match("https://[link.]*shotgun.live/.*")) {
        ctx.reply("Vous devez renseigner un lien Shotgun valide pour ajouter une rave !");
        throw "Invalid Shotgun URL";
    }
    let response = await requestShotgun(raveKeyURL);
    let shotgunEvent = getContent(response.data);
    if (shotgunEvent == null) {
        ctx.reply("Le lien Shotgun que vous avez renseigné n'est pas valide !");
        throw "Invalid Shotgun URL";
    }
    let event = createShotgunEvent(shotgunEvent);
    if (raveList.some(existingRave => existingRave.name === event.name)) {
        ctx.reply("L'évenement existe déjà dans la liste des raves !");
        throw "Event already exists";
    }
    return event;
}

async function updateRaveList(ctx, raveKeyURL, remove) {
    removeOldRaves();
    if (!remove) {
        let event = {};
        try {
            if (raveKeyURL.startsWith("https://dice.fm")) {
               ctx.reply("L'ajout d'une rave Dice n'est pas supporté, ratio Dice et leur anti-bot :'(")
               throw "Dice not supported";
            } else {
                event = await shotgunRave(ctx,raveKeyURL);
            }
            raveList.push(event);
            await writeToRaveFile();
            return event.url
        } catch (error) {
            throw (error);
        }
    } else {
        await removeSelectedRave(ctx);
    }
};

exports.nextRaveIndex = nextRaveIndex;
exports.removeOldRaves = removeOldRaves;
exports.getRaveIndex = getRaveIndex;
exports.updateRaveList = updateRaveList;
exports.reloadRaveList = reloadRaveList;
exports.getRaveList = getRaveList;
exports.writeToRaveFile = writeToRaveFile;
exports.updateRaveContent = updateRaveContent;
exports.setInformRaveChange = setInformRaveChange;
