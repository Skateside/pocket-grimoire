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
    lookupOneCached
} from "./utils/elements.js";
import QRCode from "./lib/qrcode-svg.js";

const url = new URL(window.location.href);
const name = url.searchParams.get("name") || "";

// Populate or hide the title.
const title = lookupOne("#title");
title.textContent = name;
title.hidden = !name;

if (name) {
    document.title = `${name} - ${document.title}`;
}

// Draw the character sheet.
const store = Store.create("pocket-grimoire");
const gameObserver = Observer.create("game");

CharacterToken.setTemplates({
    sheet: Template.create(lookupOne("#edition-template")),
    jinx: Template.create(lookupOne("#edition-template-jinx"))
});

const lang = document.documentElement.lang || "en-GB";

fetchFromStore(`characters_${lang}`, URLS.characters, store).then((characters) => {
    gameObserver.trigger("characters-loaded", { characters });
});

fetchFromStore(`jinxes_${lang}`, URLS.jinxes, store).then((jinxes) => {
    gameObserver.trigger("jinxes-loaded", { jinxes });
});

Promise.all([
    new Promise((resolve) => {
        gameObserver.on("characters-loaded", ({ detail }) => {
            resolve(detail.characters);
        });
    }),
    new Promise((resolve) => {
        gameObserver.on("jinxes-loaded", ({ detail }) => {
            resolve(detail.jinxes);
        });
    })
]).then(([ characters, jinxes ]) => {

    TokenStore.create({
        characters,
        jinxes
    });

});

TokenStore.ready((tokenStore) => {

    const ids = url.searchParams.get("characters")?.split(",") || [];
    const script = tokenStore
        .getAllCharacters()
        .filter((character) => ids.includes(character.getId()));

    script.forEach((character) => {

        character.getJinxes().forEach((jinx) => {

            const trick = script.find((char) => jinx.matches(char));

            if (!trick) {
                return
            }

            character.toggleJinxReady(trick, true);

        });

    });

    script.forEach((character) => {

        const team = character.getTeam();

        lookupOneCached(`#wrapper-${team}`).classList.remove("is-empty");
        lookupOneCached(`#team-${team}`).append(character.drawSheet());

    });

});

// Generate the QR code.
lookupOne("#qr-code").append(QRCode({
    msg: window.location.href,
    ecl: "L"
}));

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

// Change Language.
lookupOne("#locale-form").addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = lookupOne("#select-locale").value;
});
