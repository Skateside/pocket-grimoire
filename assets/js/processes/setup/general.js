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
    lookupOne,
    lookupCached
} from "../../utils/elements.js";

const store = Store.create("pocket-grimoire");
const gameObserver = Observer.create("game");

fetchFromStore("./assets/data/characters.json", store).then((characters) => {
    gameObserver.trigger("characters-loaded", { characters });
});

fetchFromStore("./assets/data/game.json", store).then((breakdown) => {
    gameObserver.trigger("team-breakdown-loaded", { breakdown });
});

CharacterToken.setTemplates({
    token: Template.create(lookupOne("#character-template")),
    select: Template.create(lookupOne("#character-select-template")),
    nightOrder: Template.create(lookupOne("#night-info-template"))
});
ReminderToken.setTemplate(
    Template.create(lookupOne("#reminder-template"))
);

gameObserver.on("characters-loaded", ({ detail }) => {
    TokenStore.create(detail.characters);
});

lookupCached("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});

// TODO: load data from the store.
