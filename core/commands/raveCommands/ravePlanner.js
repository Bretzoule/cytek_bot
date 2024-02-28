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
    if (response.request.res.responseUrl != raveKeyURL) {
        let tmpResponse = await axios(response.request.res.responseUrl);
        newURL = tmpResponse.data.match(/window\.top\.location = (validateProtocol\(("https:\/\/.*?)"{1})/)[0];
        newURL = newURL.replace("window.top.location = validateProtocol(", "");
        newURL = newURL.replace(/"/g, "");
        response = await axios(newURL);
    }
    return response;
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
    let raveChanged = false;
    let raves = getRaveList();
    for (let i = 0; i < raves.length; i++) {
        let response = await requestShotgun(raves[i].url)
        let content = getContent(response.data);
        let shotgunEvent = createEvent(content, raves[i].attending);
        if (JSON.stringify(shotgunEvent) != JSON.stringify(raves[i])) {
            raves[i] = shotgunEvent;
            raveChanged = true;
            notifyForPriceChange(raves[i], shotgunEvent, bot);
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

function createEvent(shotgunEvent, attendingList = []) {
    let url = "https://maps.google.fr"
    if (shotgunEvent.location.name != null && shotgunEvent.location.geo != null) {
        url = `https://www.google.com/maps/search/${shotgunEvent.location.name} ${shotgunEvent.location.address.streetAddress}/@${shotgunEvent.location.geo.latitude},${shotgunEvent.location.geo.longitude}`
    }
    return {
        name: shotgunEvent.name.replace(/&amp;/g, '&'),
        description: shotgunEvent.description.replace(/&amp;/g, '&').substring(0, 100) + "..." ?? "Pas de description",
        startDate: `${shotgunEvent.startDate}`,
        endDate: `${shotgunEvent.endDate}`,
        image: shotgunEvent.image[0],
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

async function updateRaveList(ctx, raveKeyURL, remove) {
    removeOldRaves();
    if (!remove) {
        try {
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
            let event = createEvent(shotgunEvent);
            if (raveList.some(existingRave => existingRave.name === event.name)) {
                ctx.reply("L'évenement existe déjà dans la liste des raves !");
                throw "Event already exists";
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
