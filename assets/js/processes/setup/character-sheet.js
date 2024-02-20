import Observer from "../../classes/Observer.js";
import QRCode from "../../lib/qrcode-svg.js";
import {
    empty,
    lookupOneCached
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const characterStore = Object.create(null);

/**
 * Draws the QR code based on information on the QR code element.
 */
function drawQRCode() {

    const includeTravellers = lookupOneCached("#include-travellers").checked;
    const includeFabled = lookupOneCached("#include-fabled").checked;
    const qrCode = lookupOneCached("#qr-code");
    const anchor = lookupOneCached("#qr-code-link");
    const url = new URL(anchor.href);

    const {
        name,
        game
    } = qrCode.dataset;

    if (name) {
        url.searchParams.set("name", name);
    } else {
        url.searchParams.delete("name");
    }

    if (game) {

        url.searchParams.set("game", game);
        url.searchParams.set("traveller", Number(includeTravellers));
        url.searchParams.set("fabled", Number(includeFabled));
        url.searchParams.delete("characters");

    } else {

        const teams = [
            "townsfolk",
            "outsider",
            "minion",
            "demon"
        ];

        if (includeTravellers) {
            teams.push("traveller");
        }

        if (includeFabled) {
            teams.push("fabled");
        }

        const ids = characterStore[qrCode.dataset.characters]
            .filter((character) => teams.includes(character.getTeam()))
            .map((character) => character.getId());
        url.searchParams.set("characters", ids);
        url.searchParams.delete("game");
        url.searchParams.delete("traveller");
        url.searchParams.delete("fabled");

    }

    empty(qrCode).append(QRCode({
        msg: url.toString(),
        ecl: "L"
    }));
    lookupOneCached("#qr-code-button").disabled = false;
    anchor.href = url.toString();
    lookupOneCached("#qr-code-link").disabled = false;

}

gameObserver.on("characters-selected", ({ detail }) => {

    const {
        name,
        characters,
        game
    } = detail;

    const qrCode = lookupOneCached("#qr-code");

    if (game) {

        qrCode.dataset.game = game;
        delete qrCode.dataset.characters;

    } else {

        const ids = JSON.stringify(
            characters.map((character) => character.getId())
        );

        characterStore[ids] = characters;
        qrCode.dataset.characters = ids;
        delete qrCode.dataset.game;

    }

    if (name) {
        qrCode.dataset.name = name;
    } else {
        delete qrCode.dataset.name;
    }

    drawQRCode();

});

lookupOneCached("#include-travellers").addEventListener("change", () => {
    drawQRCode();
});

lookupOneCached("#include-fabled").addEventListener("change", () => {
    drawQRCode();
});
