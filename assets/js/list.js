import Template from "./classes/Template.js";
import CharacterToken from "./classes/CharacterToken.js";
import Observer from "./classes/Observer.js";
import Store from "./classes/Store.js";
import TokenStore from "./classes/TokenStore.js";
import Dialog from "./classes/Dialog.js";
import {
    fetchFromStore
} from "./utils/fetch.js";
import {
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached,
    replaceContentsMany
} from "./utils/elements.js";
import qrcode from "./lib/qrcode.js";

const url = new URL(window.location.href);
const name = url.searchParams.get("name") || "";

// Populate or hide the title.
const title = lookupOne("#title");
title.textContent = name;
title.hidden = !name;

// Draw the character list.
const store = Store.create("pocket-grimoire");
const gameObserver = Observer.create("game");

CharacterToken.setTemplates({
    sheet: Template.create(lookupOne("#edition-template"))
});

fetchFromStore("./assets/data/characters.json", store).then((characters) => {
    gameObserver.trigger("characters-loaded", { characters });
});

gameObserver.on("characters-loaded", ({ detail }) => {
    TokenStore.create(detail.characters);
});

TokenStore.ready(({ characters }) => {

    const ids = url.searchParams.get("characters")?.split(",") || [];

    Object.values(characters)
        .filter((character) => ids.includes(character.getId()))
        .forEach((character) => {

            const team = character.getTeam();

            lookupOneCached(`#wrapper-${team}`).classList.remove("is-empty");
            lookupOneCached(`#team-${team}`).append(character.drawSheet());

        });

});

// Generate the QR code.
const qr = new qrcode(0, "H");
qr.addData(window.location.href);
qr.make();
lookupOne("#qr-code").innerHTML = qr.createSvgTag({});

// Activate the dialogs.
lookup("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});

// Force the details to be open when printing.
function openAllDetails() {

    lookupCached(".details").forEach((details) => {

        if (details.dataset.open) {
            return;
        }

        details.dataset.open = details.open;
        details.open = true;

    });

}

function closeDetails() {

    lookupCached(".details").forEach((details) => {

        if (!details.dataset.open) {
            return;
        }

        details.open = details.dataset.open === "true";
        delete details.dataset.open;

    });

}

const printQuery = window.matchMedia("print");
printQuery.addListener(({ matches }) => {

    if (matches) {
        openAllDetails();
    } else {
        closeDetails();
    }

});

if (printQuery.matches) {
    openAllDetails();
}

window.addEventListener("beforeprint", openAllDetails);
window.addEventListener("afterprint", closeDetails);
