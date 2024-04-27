import Pad from "../../classes/Pad.js";
import Positioner from "../../classes/Positioner.js";
import Observer from "../../classes/Observer.js";
import ReminderToken from "../../classes/ReminderToken.js";
import Dialog from "../../classes/Dialog.js";
import TokenStore from "../../classes/TokenStore.js";
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

// Token auto-placements.

pad.setPositioner(new Positioner());

const tokenLayout = lookupOne("#token-layout");

pad.updatePositioner({
    layout: tokenLayout.value,
    // At this stage, most of the positioner probably hasn't been set up so we'd
    // get a few issues if we try to generate the co-ordinates. Better to just
    // give the positioner some data and generate the co-ordinates later.
    generate: false
});

tokenLayout.addEventListener("change", () => {
    pad.updatePositioner({ layout: tokenLayout.value });
});

gameObserver.on("player-count", ({ detail }) => {
    pad.updatePositioner({ total: detail.count });
});

gameObserver.on("pad-height-change", () => {
    pad.updatePositioner({ container: true });
});

Dialog.create(lookupOneCached("#character-select")).on(Dialog.SHOW, () => {

    const grimoireSection = lookupOneCached("#grimoire");
    const isOpen = grimoireSection.open;

    if (!isOpen) {
        grimoireSection.open = true;
    }

    pad.updatePositioner({
        container: true,
        tokens: true,
        total: lookupOneCached("#player-count").value
    });

    if (!isOpen) {
        grimoireSection.open = false;
    }

});

TokenStore.ready((tokenStore) => {
    pad.setTokenStore(tokenStore);
});
