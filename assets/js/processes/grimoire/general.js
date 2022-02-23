import Pad from "../../classes/Pad.js";
import Template from "../../classes/Template.js";
import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
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

    const characterTemplate = Template.create(
        lookupOneCached("#character-list-template")
    );
    const {
        characters
    } = detail;

    replaceContentsMany(
        lookupOneCached("#character-list__list"),
        characters
            .filter((character) => character.getTeam() !== "fabled")
            .map((character) => characterTemplate.draw([
                [
                    ".js--character-list--button",
                    character.getId(),
                    (element, content) => element.dataset.tokenId = content
                ],
                [
                    ".js--character-list--token",
                    character.drawToken(),
                    Template.append
                ]
            ]))
    );

    const reminders = characters.reduce((reminders, character) => {
        return reminders.concat(character.getReminders());
    }, []);
    const reminderTemplate = Template.create(
        lookupOneCached("#reminder-list-template")
    );

    replaceContentsMany(
        lookupOneCached("#reminder-list__list"),
        reminders.map((reminder) => reminderTemplate.draw([
            [
                ".js--reminder-list--button",
                reminder.getId(),
                (element, content) => element.dataset.reminderId = content
            ],
            [
                ".js--reminder-list--button",
                reminder.drawToken(),
                Template.append
            ]
        ]))
    );

    lookupOneCached("#add-token").disabled = false;
    lookupOneCached("#add-reminder").disabled = false;

});

lookupOneCached("#character-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-token-id]");

    if (!button) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        pad.addCharacter(tokenStore.getCharacter(button.dataset.tokenId));
        Dialog.create(lookupOneCached("#character-list")).hide();

    });

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
