import CharacterData from "./classes/CharacterData.js";
import Dialog from "./classes/Dialog.js";
import {
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached
} from "./utils/elements.js";
import qrcode from "./lib/qrcode.js";

const url = new URL(window.location.href);
const name = url.searchParams.get("name") || "";

// Populate or hide the title.
const title = lookupOne("#title");
title.textContent = name;
title.hidden = !name;

// Load the list of characters.
CharacterData
    .create()
    .getIds(
        (url.searchParams.get("characters")?.split(",") || [])
            .map((id) => ({ id }))
    )
    .then((characters) => {

        characters.forEach(({
            name,
            image,
            team,
            ability
        }) => {

            const clone = lookupOneCached("#edition-template")
                .content
                .cloneNode(true);
            const nameElement = clone.querySelector(".js--edition--name");
            const imageElement = clone.querySelector(".js--edition--image");
            const abilityElement = clone.querySelector(".js--edition--ability");

            nameElement.textContent = name;
            imageElement.src = image;
            abilityElement.textContent = ability;

            lookupOneCached(`#wrapper-${team}`).classList.remove("is-empty");
            lookupOneCached(`#team-${team}`).append(clone);

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
