import Store from "../../classes/Store.js";
import Dialog from "../../classes/Dialog.js";
import {
    lookupOne,
} from "../../utils/elements.js";
import {
    empty,
} from "../../utils/objects.js";

const gameData = Object.create(null);

Store.create("pocket-grimoire").addListener(({ detail }) => {

    empty(gameData);
    Object.assign(gameData, {
        script: detail.characters.name,
        date: (new Date()).toISOString(),
        day: 1,
        players: detail.tokens.map((token) => {

            return {
                tokens: [],
                name: token.playerName,
                me: false,
                dead: token.isDead,
                id: window.crypto.randomUUID(),
                suspectedRole: {
                    id: token.id
                }
            };

        })
    });

});

const trigger = lookupOne("#export-trigger");
const holder = lookupOne("#export-holder");
const image = lookupOne("#export-image");

trigger.addEventListener("click", () => {

    trigger.classList.add("is-loading");

    fetch("https://qr-thing.netlify.app/.netlify/functions/qr", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(gameData),
        })
        .then((response) => response.json())
        .then((json) => {

            image.src = json.qr;
            trigger.classList.remove("is-loading");
            holder.hidden = false;

        });

});

const dialog = Dialog.create(lookupOne("#game-export"));

dialog.on(Dialog.HIDE, () => {
    holder.hidden = true;
    trigger.classList.remove("is-loading");
});
