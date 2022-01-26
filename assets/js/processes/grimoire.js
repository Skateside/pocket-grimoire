import Pad from "../classes/Pad.js";
import Template from "../classes/Template.js";
import Observer from "../classes/Observer.js";
import TokenStore from "../classes/TokenStore.js";
import Dialog from "../classes/Dialog.js";
import {
    empty,
    identify,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

const padElement = lookupOne(".pad");
const pad = new Pad(padElement, tokenObserver);

const styleObserver = new MutationObserver((mutations) => {

    gameObserver.trigger("pad-height-change", {
        height: mutations[0].target.style.height
    });

});

styleObserver.observe(padElement, {
    attributes: true,
    attributeFilter: ["style"]
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
        characters.map((character) => characterTemplate.draw([
            [
                ".js--character-list--button",
                character.getId(),
                (element, content) => element.dataset.tokenId = content
            ],
            [
                ".js--character-list--token",
                character.draw(),
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
                reminder.draw(),
                Template.append
            ]
        ]))
    );

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

lookupOneCached("#reminder-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-reminder-id]");

    if (!button) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        pad.addReminder(tokenStore.getReminder(button.dataset.reminderId));
        Dialog.create(lookupOneCached("#reminder-list")).hide();

    });

});

gameObserver.on("character-drawn", ({ detail }) => {
    pad.addNewCharacter(detail.character);
});

tokenObserver.on("character-click", ({ detail }) => {

    const {
        element
    } = detail;
    const character = pad.getCharacterByToken(element);
    const dialog = lookupOneCached("#character-show");
    dialog.dataset.token = `#${identify(element)}`;

    empty(lookupOneCached("#character-show-token")).append(character.draw());
    lookupOneCached("#character-show-ability").textContent = character.getAbility();

    Dialog.create(dialog).show();

});

lookupOne("#character-shroud-toggle").addEventListener("click", ({ target }) => {

    pad.toggleDeadByToken(
        lookupOne(target.closest("[data-token]").dataset.token)
    );
    Dialog.create(target.closest(".dialog")).hide();

});

lookupOne("#character-remove").addEventListener("click", ({ target }) => {

    pad.removeCharacterByToken(
        lookupOne(target.closest("[data-token]").dataset.token)
    );
    Dialog.create(target.closest(".dialog")).hide();

});

tokenObserver.on("reminder-click", ({ detail }) => {
    pad.removeReminderByToken(detail.element);
});

lookupOne("#reset-height").addEventListener("click", () => {
    lookupOneCached(".pad").style.height = "";
});

lookupOne("#clear-grimoire").addEventListener("click", () => {

    // TODO: get this text out of the JS and into the HTML so it can be localised.
    if (window.confirm("Are you sure you want to clear all the tokens?")) {
        pad.reset();
    }

});

// Update the night order on the tokens.
const nightOrder = {
    first: [],
    other: []
};

function updateTokens() {

    let firstCount = 0;

    nightOrder.first.forEach((tokens) => {

        firstCount += 1;

        tokens.forEach(({ character, token }) => {
            Pad.getToken(token).dataset.firstNight = firstCount;
        });

    });

    let otherCount = 0;

    nightOrder.other.forEach((tokens) => {

        otherCount += 1;

        tokens.forEach(({ character, token }) => {
            Pad.getToken(token).dataset.otherNight = otherCount;
        });

    });

}

tokenObserver.on("character-add", ({ detail }) => {

    const {
        character,
        token
    } = detail;
    const {
        first,
        other
    } = nightOrder;

    const firstNight = character.getFirstNight();

    if (firstNight) {

        if (!first[firstNight]) {
            first[firstNight] = [];
        }

        first[firstNight].push({
            character,
            token
        });

    }

    const otherNight = character.getOtherNight();

    if (otherNight) {

        if (!other[otherNight]) {
            other[otherNight] = [];
        }

        other[otherNight].push({
            character,
            token
        });

    }

    updateTokens();

});

tokenObserver.on("character-remove", ({ detail }) => {

    const {
        character,
        token
    } = detail;

    const firstNight = character.getFirstNight();
    const firstArray = nightOrder.first[firstNight];

    if (firstArray) {

        const index = firstArray.findIndex((info) => info.token === token);

        if (index > -1) {
            firstArray.splice(index, 1);
        }

        if (!firstArray.length) {
            delete nightOrder.first[firstNight];
        }

    }

    const otherNight = character.getOtherNight();
    const otherArray = nightOrder.other[otherNight];

    if (otherArray) {

        const index = otherArray.findIndex((info) => info.token === token);

        if (index > -1) {
            otherArray.splice(index, 1);
        }

        if (!otherArray.length) {
            delete nightOrder.other[otherNight];
        }

    }

    updateTokens();

});
