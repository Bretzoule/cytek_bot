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

function cytekHydrator(rawCYTEKData) {
  currentCytek.name = rawCYTEKData.name ?? "TBA";
  currentCytek.description = rawCYTEKData.description ?? "TBA";
  currentCytek.startDate = rawCYTEKData.startDate ?? "TBA";
  currentCytek.endDate = rawCYTEKData.endDate ?? "TBA";
  currentCytek.image = rawCYTEKData.image ?? "/assets/images/cytek.png";
  currentCytek.url = rawCYTEKData.url ?? "TBA";
  currentCytek.location.name = rawCYTEKData.location.name ?? "TBA";
  currentCytek.location.address = rawCYTEKData.location.address ?? "TBA";
  currentCytek.location.url = rawCYTEKData.location.url ?? "TBA";
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
exports.getCYTek = getCYTek;
