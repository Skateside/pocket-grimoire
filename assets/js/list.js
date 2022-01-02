import CharacterData from "./classes/CharacterData.js";
import Dialog from "./classes/Dialog.js";
import {
    lookup,
    lookupOne,
    lookupOneCached
} from "./utils/elements.js";
import qrcode from "./lib/qrcode.js";

const url = new URL(window.location.href);
const name = url.searchParams.get("name") || "";
const title = lookupOne("#title");

title.textContent = name;
title.hidden = !name;

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

            lookupOneCached(`#team-${team}`).append(clone);

        });

    });

const qr = new qrcode(0, "H");
qr.addData(window.location.href);
qr.make();
lookupOne("#qr-code").innerHTML = qr.createSvgTag({});

lookup("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});
