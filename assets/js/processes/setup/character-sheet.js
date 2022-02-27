import Observer from "../../classes/Observer.js";
import qrcode from "../../lib/qrcode.js";
import {
    lookupOneCached
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const characterStore = Object.create(null);
const qrCodeCache = Object.create(null);

function makeQRCode(url) {

    if (!qrCodeCache[url]) {

        const qr = new qrcode(0, "H");
        qr.addData(url);
        qr.make();
        qrCodeCache[url] = qr.createSvgTag({});

    }

    return qrCodeCache[url];

}

function drawQRCode() {

    const teams = [
        "townsfolk",
        "outsider",
        "minion",
        "demon"
    ];

    if (lookupOneCached("#include-travellers").checked) {
        teams.push("traveller");
    }

    if (lookupOneCached("#include-fabled").checked) {
        teams.push("fabled");
    }

    const qrCode = lookupOneCached("#qr-code");

    const ids = characterStore[qrCode.dataset.characters]
        .filter((character) => teams.includes(character.getTeam()))
        .map((character) => character.getId());

    const url = new URL(window.location.href);
    const {
        pathname
    } = url;
    const page = pathname.slice(0, pathname.lastIndexOf("/") + 1);
    url.pathname = `${page}sheet.html`;

    const name = qrCode.dataset.name;
    if (name) {
        url.searchParams.append("name", name);
    }

    url.searchParams.append("characters", ids);

    const cacheKey = url.searchParams.toString();
    let qrSVG = qrCodeCache[cacheKey]

    qrCode.innerHTML = makeQRCode(url.toString());
    lookupOneCached("#qr-code-button").disabled = false;
    lookupOneCached("#qr-code-link").href = url.toString();
    lookupOneCached("#qr-code-link").disabled = false;

}

gameObserver.on("characters-selected", ({ detail }) => {

    const {
        name,
        characters
    } = detail;
    const ids = JSON.stringify(
        characters.map((character) => character.getId())
    );

    characterStore[ids] = characters;

    const qrCode = lookupOneCached("#qr-code");

    if (name) {
        qrCode.dataset.name = name;
    } else {
        delete qrCode.dataset.name;
    }

    qrCode.dataset.characters = ids;
    drawQRCode();

});

lookupOneCached("#include-travellers").addEventListener("change", () => {
    drawQRCode();
});

lookupOneCached("#include-fabled").addEventListener("change", () => {
    drawQRCode();
});
