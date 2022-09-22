import Dialog from "../../classes/Dialog.js";
import Observer from "../../classes/Observer.js";
import Pad from "../../classes/Pad.js";
import Template from "../../classes/Template.js";
import TokenStore from "../../classes/TokenStore.js";
import CharacterToken from "../../classes/CharacterToken.js";
import {
    identify,
    lookup,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");
const pad = lookupOneCached(".js--pad").pad;
const recentReminders = lookupOneCached("#character-show-reminders");

// Set up the token dialog when a character token is clicked.
tokenObserver.on("character-click", ({ detail }) => {

    const {
        element
    } = detail;
    const character = pad.getCharacterByToken(element);
    const dialog = lookupOneCached("#character-show");
    dialog.dataset.token = `#${identify(element)}`;

    lookupOneCached("#character-show-name").textContent = character.getName();
    lookupOneCached("#character-show-ability").textContent = character.getAbility();
    recentReminders.dataset.coords = JSON.stringify(pad.getTokenPosition(element));

    Dialog.create(dialog).show();

});

// Update the recently-added-reminders list as a reminder is added.
tokenObserver.on("reminder-add", ({ detail }) => {

    const {
        reminder
    } = detail;
    const id = reminder.getId();
    const items = lookup(".js--reminder-list--item", recentReminders);

    const existing = items.find(({ dataset }) => dataset.reminderId === id);

    if (existing && existing === items[0]) {
        return;
    }

    if (items.length > 2 || (existing && existing !== items[0])) {
        (existing || items[items.length - 1]).remove();
    }

    recentReminders.prepend(reminder.drawList());

});

function getToken(target) {
    return lookupOne(target.closest("[data-token]").dataset.token);
}

function hideDialog(target) {
    Dialog.create(target.closest(".dialog")).hide();
}

TokenStore.ready((tokenStore) => {

    // Show a token as it's clicked from the "show tokens" dialog.
    lookupOne("#character-show-token").addEventListener("click", ({ target }) => {

        CharacterToken.show(pad.getCharacterByToken(getToken(target)));
        hideDialog(target);

    });

});

lookupOne("#character-shroud-toggle").addEventListener("click", ({ target }) => {

    pad.toggleDeadByToken(getToken(target));
    hideDialog(target);

});

lookupOne("#character-rotate").addEventListener("click", ({ target }) => {

    pad.rotateByToken(getToken(target));
    hideDialog(target);

});

lookupOne("#character-reminder").addEventListener("click", ({ target }) => {

    const reminder = lookupOneCached("#reminder-list");
    const token = getToken(target);

    reminder.dataset.coords = JSON.stringify(pad.getTokenPosition(token));
    Dialog.create(reminder).show();
    hideDialog(target);

});

lookupOne("#character-name").addEventListener("click", ({ target }) => {

    const token = getToken(target);
    const name = window.prompt(
        window.I18N.playerName,
        lookupOneCached(".js--character--player-name", token)?.textContent || ""
    );

    if (name === null) {
        return;
    }

    pad.setPlayerNameForToken(token, name);
    hideDialog(target);

});

lookupOne("#character-remove").addEventListener("click", ({ target }) => {

    pad.removeCharacterByToken(getToken(target));
    hideDialog(target);

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
    const {
        first,
        other
    } = nightOrder;

    const firstNight = character.getFirstNight();
    const firstArray = first[firstNight];

    if (firstArray) {

        const index = firstArray.findIndex((info) => info.token === token);

        if (index > -1) {
            firstArray.splice(index, 1);
        }

        if (!firstArray.length) {
            delete first[firstNight];
        }

    }

    const otherNight = character.getOtherNight();
    const otherArray = other[otherNight];

    if (otherArray) {

        const index = otherArray.findIndex((info) => info.token === token);

        if (index > -1) {
            otherArray.splice(index, 1);
        }

        if (!otherArray.length) {
            delete other[otherNight];
        }

    }

    updateTokens();

});

// List of tokens.
// TODO: could we use character.drawList() here?

const tokenListTemplate = Template.create(lookupOne("#token-list-template"));
const tokenList = lookupOne("#token-list__list");

gameObserver.on("characters-selected", ({ detail }) => {

    const characters = detail.characters.filter((character) => {
        const team = character.getTeam();
        return team !== "traveller";
    });

    replaceContentsMany(
        tokenList,
        characters.map((character) => tokenListTemplate.draw([
            [
                ".js--token-list--button",
                character.getId(),
                (element, content) => element.dataset.tokenId = content
            ],
            [
                ".js--token-list--token",
                character.drawToken(),
                Template.append
            ]
        ]))
    );

});

TokenStore.ready((tokenStore) => {

    const tokenListDialog = Dialog.create(lookupOne("#token-list"));

    tokenList.addEventListener("click", ({ target }) => {

        const button = target.closest("[data-token-id]");

        if (!button) {
            return;
        }

        CharacterToken.show(tokenStore.getCharacter(button.dataset.tokenId));
        tokenListDialog.hide();

    });

});
