const fs = require("fs");
let currentCytek = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  image: "",
  url: "",
  location: {
    name: "",
    address: "",
    url: "",
  },
  prices: [],
  attending: [],
};

function getCYTek() {
  return currentCytek;
}

function cytekHydrator(rawCYTEKData = {}) {
  currentCytek.name = rawCYTEKData.name ?? "";
  currentCytek.description = rawCYTEKData.description ?? "TBA";
  currentCytek.startDate = rawCYTEKData.startDate ?? "TBA";
  currentCytek.endDate = rawCYTEKData.endDate ?? "TBA";
  currentCytek.image = rawCYTEKData.image ?? "misc/images/cytek/logo_cytek.jpg";
  currentCytek.url = rawCYTEKData.url ?? "https://google.fr";
  currentCytek.location.name = rawCYTEKData.location?.name ?? "TBA";
  currentCytek.location.address = rawCYTEKData?.location?.address ?? "TBA";
  currentCytek.location.url = rawCYTEKData.location?.url ?? "https://google.fr";
  currentCytek.prices = rawCYTEKData.prices ?? [];
  currentCytek.attending = rawCYTEKData.attending ?? [];
}

async function writeToCYTekFile() {
  fs.writeFileSync(
    `core/commands/cytekCommands/cytekContent.json`,
    JSON.stringify(currentCytek),
    async function (err) {
      if (err) {
        console.log(err);
      }
      await reloadRaveList();
    }
  );
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

async function updateCYTekData(args) {
  switch (args[0]) {
    case "name":
      currentCytek.name = args[1];
      break;
    case "description":
      currentCytek.description = args[1];
      break;
    case "startDate":
      let startDate = new Date(args[1]);
      if (isValidDate(startDate)) {
        currentCytek.startDate = startDate
      } else {
        throw Error("InvalidDateFormat");
      }
      break;
    case "endDate":
      let endDate = new Date(args[1]);
      if (isValidDate(endDate)) {
        currentCytek.endDate = endDate
      } else {
        throw Error("InvalidDateFormat");
      }
      break;
    case "reset":
      cytekHydrator();
      break;
    default:
      console.log("Liste des champs modifiables : \n name \n description \n startDate \n endDate \n reset");
      break;
  }
  writeToCYTekFile();
}

async function fetchCYTekContent() {
  try {
    let cytekData = fs.readFileSync(
      `core/commands/cytekCommands/cytekContent.json`
    );
    cytekHydrator(JSON.parse(cytekData));
  } catch (error) {
    console.log("Error while reading cytekPlanner.json");
    console.log(error);
  }
}

exports.writeToCYTekFile = writeToCYTekFile;
exports.fetchCYTekContent = fetchCYTekContent;
exports.updateCYTekData = updateCYTekData;
exports.getCYTek = getCYTek;
