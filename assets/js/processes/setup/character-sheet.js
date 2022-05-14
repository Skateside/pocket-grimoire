import Observer from "../../classes/Observer.js";
import QRCode from "../../lib/qrcode-svg.js";
import {
    empty,
    lookupOneCached
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const characterStore = Object.create(null);

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
        url.searchParams.set("name", name);
    } else {
        url.searchParams.delete("name");
    }

    url.searchParams.set("characters", ids);

    empty(qrCode).append(QRCode({
        msg: url.toString(),
        ecl: "L"
    }));
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
