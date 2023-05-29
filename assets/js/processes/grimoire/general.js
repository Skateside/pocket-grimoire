import Pad from "../../classes/Pad.js";
import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
import ReminderToken from "../../classes/ReminderToken.js";
import Dialog from "../../classes/Dialog.js";
import {
    lookup,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

const padElement = lookupOneCached(".js--pad");
const pad = new Pad(padElement, tokenObserver);
padElement.pad = pad;

const styleObserver = new MutationObserver((mutations) => {

    gameObserver.trigger("pad-height-change", {
        height: mutations[0].target.style.height
    });

});

styleObserver.observe(padElement, {
    attributes: true,
    attributeFilter: ["style"]
});

// If the elements are within a closed <details> element then their height and
// width will be 0. Listen for the pad becoming visible and update the class.
lookup("details").forEach((details) => {

    details.addEventListener("toggle", () => {
        pad.updateDimensions();
    });

});

gameObserver.on("characters-selected", ({ detail }) => {

    const characters = detail.characters.filter((character) => {
        const team = character.getTeam();
        return team !== "fabled" && team !== "traveller";
    });

    replaceContentsMany(
        lookupOneCached("#character-list__list"),
        characters.map((character) => character.drawList())
    );

    const reminders = characters.reduce((reminders, character) => {
        return reminders.concat(character.getReminders());
    }, ReminderToken.getGlobal());

    replaceContentsMany(
        lookupOneCached("#reminder-list__list"),
        reminders.map((reminder) => reminder.drawList())
    );

    lookupOneCached("#add-token").disabled = false;
    lookupOneCached("#add-reminder").disabled = false;
    lookupOneCached("#show-tokens").disabled = false;

});

const characterList = lookupOneCached("#character-list");
const characterListDialog = Dialog.create(characterList);

lookupOneCached("#character-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-token-id]");

    if (!button) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        const {
            character,
            token: newToken
        } = pad.addCharacter(tokenStore.getCharacterClone(button.dataset.tokenId));
        const replace = JSON.parse(characterList.dataset.replace || "null");

        if (replace) {

            const {
                token,
                coords: {
                    x,
                    y,
                    z
                }
            } = replace;

            const oldCharacter = pad.getCharacterByToken(lookupOne(token));
            pad.toggleDead(character, oldCharacter.getIsDead());
            pad.rotate(character, oldCharacter.getIsUpsideDown());
            pad.setPlayerName(character, pad.getPlayerName(oldCharacter));
            pad.removeCharacter(oldCharacter);
            pad.moveToken(newToken, x, y, z);

        }

        characterListDialog.hide();

    });

});

characterListDialog.on(Dialog.HIDE, ({ target }) => {
    target.removeAttribute("data-replace");
});

gameObserver.on("character-drawn", ({ detail }) => {
    pad.addNewCharacter(detail.character);
});

lookupOne("#show-night-order").addEventListener("change", ({ target }) => {

    padElement.style[
        target.checked
        ? "removeProperty"
        : "setProperty"
    ]("--night-order-display", "none");

});

gameObserver.on("clear", () => pad.reset());

// Character and Reminder token sizes.

const html = document.documentElement;

lookupOne("#token-size").addEventListener("input", ({ target }) => {
    html.style.setProperty("--token-size", target.value);
});

lookupOne("#reminder-size").addEventListener("input", ({ target }) => {
    html.style.setProperty("--reminder-size", target.value);
});
