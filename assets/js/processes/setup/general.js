import Store from "../../classes/Store.js";
import Observer from "../../classes/Observer.js";
import Template from "../../classes/Template.js";
import CharacterToken from "../../classes/CharacterToken.js";
import ReminderToken from "../../classes/ReminderToken.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import {
    fetchFromStore
} from "../../utils/fetch.js";
import {
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached
} from "../../utils/elements.js";
import {
    hash
} from "../../utils/strings.js";

const store = Store.create("pocket-grimoire");
const gameObserver = Observer.create("game");

fetchFromStore(
    "characters",
    hash("./assets/data/characters.json"),
    store
).then((characters) => {
    gameObserver.trigger("characters-loaded", { characters });
});

fetchFromStore(
    "jinx",
    hash("./assets/data/jinx.json"),
    store
).then((jinxes) => {
    gameObserver.trigger("jinxes-loaded", { jinxes });
});

fetchFromStore(
    "game",
    hash("./assets/data/game.json"),
    store
).then((breakdown) => {
    gameObserver.trigger("team-breakdown-loaded", { breakdown });
});

CharacterToken.setTemplates({
    token: Template.create(lookupOne("#character-template")),
    list: Template.create(lookupOne("#character-list-template")),
    select: Template.create(lookupOne("#character-select-template")),
    nightOrder: Template.create(lookupOne("#night-info-template"))
});
ReminderToken.setTemplates({
    token: Template.create(lookupOne("#reminder-template")),
    list: Template.create(lookupOne("#reminder-list-template"))
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
        characters: [
            // Create an empty character which we can use as a token placeholder.
            {
                id: TokenStore.EMPTY,
                image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
                ability: lookupOne("#empty-character-ability").textContent,
                [CharacterToken.empty]: true,
            },
            ...characters
        ],
        reminders: [
            {
                id: TokenStore.EMPTY,
                name: "",
                text: lookupOne("#good-team").textContent,
                image: "./assets/img/icon/townsfolk.png",
                isGlobal: true
            },
            {
                id: TokenStore.EMPTY,
                name: "",
                text: lookupOne("#evil-team").textContent,
                image: "./assets/img/icon/demon.png",
                isGlobal: true
            }
        ],
        jinxes
    });

});

lookupCached("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});

lookup("input[data-filter-list]").forEach((input) => {

    input.addEventListener("change", ({ target }) => {

        const list = lookupOneCached(target.dataset.filterList);

        if (!list) {
            return;
        }

        list.classList.toggle("is-show-all", target.checked);

    });

});
