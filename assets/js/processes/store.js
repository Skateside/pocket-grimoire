import Store from "../classes/Store.js";
import Observer from "../classes/Observer.js";
import TokenStore from "../classes/TokenStore.js";
import {
    lookupOneCached
} from "../utils/elements.js";

const store = Store.create("pocket-grimoire");
const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

const pad = lookupOneCached(".pad").pad;

gameObserver.on("characters-selected", ({ detail }) => {

    store.setCharacters(
        detail.name,
        detail.characters.map((character) => character.getId())
    );

});

tokenObserver.on("character-add", ({ detail }) => {
    store.addToken(detail.character);
});

tokenObserver.on("character-remove", ({ detail }) => {
    store.removeToken(detail.character);
});

tokenObserver.on("reminder-add", ({ detail }) => {
    store.addToken(detail.reminder);
});

tokenObserver.on("reminder-remove", ({ detail }) => {
    store.removeToken(detail.reminder);
});

tokenObserver.on("move", ({ detail }) => {

    const {
        element,
        left,
        top,
        zIndex
    } = detail;
    const token = (
        pad.getCharacterByToken(element)
        || pad.getReminderByToken(element)
    );

    store.moveToken(token, left, top, zIndex);

});

tokenObserver.on("zindex", ({ detail }) => {

    const {
        element,
        zIndex
    } = detail;
    const token = (
        pad.getCharacterByToken(element)
        || pad.getReminderByToken(element)
    );

    store.alignToken(token, zIndex);

});

tokenObserver.on("shroud-toggle", ({ detail }) => {
    store.toggleDead(pad.getCharacterByToken(detail.token), detail.isDead);
});

const storeData = store.read();

TokenStore.ready(({
    characters,
    reminders
}) => {

    const info = storeData.characters;

    if (info && info.characters && info.characters.length) {

        gameObserver.trigger("characters-selected", {
            name: info.name,
            characters: info.characters
                .map((id) => characters[id])
                .filter(Boolean)
        });

    }

    let finalZIndex = 0;

    storeData.tokens.forEach(({
        id,
        left,
        top,
        zIndex,
        isDead
    }) => {

        const isCharacter = TokenStore.isCharacterId(id);
        const info = (
            isCharacter
            ? pad.addCharacter(characters[id])
            : pad.addReminder(reminders[id])
        );

        pad.moveToken(info.token, left, top, zIndex);

        if (isCharacter) {
            pad.toggleDead(info.character, Boolean(isDead));
        }

        if (zIndex > finalZIndex) {
            finalZIndex = zIndex;
        }

    });

    pad.setZIndex(finalZIndex);

});

// TODO: store input values (player count and night order preference) and re-load it.
