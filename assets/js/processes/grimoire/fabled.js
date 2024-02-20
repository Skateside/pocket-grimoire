import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import Template from "../../classes/Template.js";
import {
    lookup,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";
import {
    empty
} from "../../utils/objects.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");


// Include all the Fabled in the fabled list.

const homebrewFabled = Object.create(null);
const officialFabled = Object.create(null);
let characterTemplate = null;

function populateFabled() {

    const fabled = Object.values({...officialFabled, ...homebrewFabled});

    if (!characterTemplate) {

        characterTemplate = Template.create(
            lookupOneCached("#character-list-template")
        );

    }

    replaceContentsMany(
        lookupOneCached("#fabled-list__list"),
        fabled.map((fable) => characterTemplate.draw({
            ".js--character-list--item,.js--character-list--button"(element) {
                element.dataset.tokenId = fable.getId();
            },
            ".js--character-list--token"(element) {
                element.append(fable.drawToken());
            }
        }))
    );

    lookupOneCached("#add-fabled").disabled = false;

}

gameObserver.on("characters-selected", ({ detail }) => {

    empty(homebrewFabled);

    detail.characters
        .filter((character) => character.getTeam() === "fabled")
        .forEach((character) => homebrewFabled[character.getId()] = character);

    populateFabled();

});

TokenStore.ready((tokenStore) => {

    empty(officialFabled);

    tokenStore
        .getAllCharacters()
        .filter((character) => character.getTeam() === "fabled")
        .forEach((character) => officialFabled[character.getId()] = character);

    populateFabled();

});

// Add to the grimoire when clicked.

const pad = lookupOneCached(".js--pad").pad;

lookupOneCached("#fabled-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-token-id]");

    if (!button) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        pad.addCharacter(tokenStore.getCharacter(button.dataset.tokenId));
        Dialog.create(lookupOneCached("#fabled-list")).hide();

    });

});

// Night Order.

const fabledCount = Object.create(null);

tokenObserver.on("character-add", ({ detail }) => {

    const character = detail.character;

    if (character.getTeam() !== "fabled") {
        return;
    }

    const id = character.getId();

    if (!fabledCount[id]) {
        fabledCount[id] = 0;
    }

    fabledCount[id] += 1;

    const firstNight = character.getFirstNight();

    if (firstNight) {

        const first = lookupOneCached("#first-night");
        const nextFirst = lookup("[data-order]", first).find(({ dataset }) => {
            return dataset.order > firstNight;
        });

        first.insertBefore(character.drawNightOrder(true), nextFirst);

    }

    const otherNight = character.getOtherNight();

    if (otherNight) {

        const other = lookupOneCached("#other-nights");
        const nextOther = lookup("[data-order]", other).find(({ dataset }) => {
            return dataset.order > otherNight;
        });

        other.insertBefore(character.drawNightOrder(false), nextOther);

    }

    // Since the order of main.js includes this file before including the
    // night-order file, this event listener will trigger before the one there,
    // so we don't need to include funtionality to mark these new night orders
    // as "active" since the night-order file will handle that for us.

});

tokenObserver.on("character-remove", ({ detail }) => {

    const character = detail.character;

    if (character.getTeam() !== "fabled") {
        return;
    }

    const id = character.getId();

    if (fabledCount[id]) {
        fabledCount[id] -= 1;
    }

    if (!fabledCount[id]) {

        lookupOne(`#first-night [data-id="${id}"]`)?.remove();
        lookupOne(`#other-nights [data-id="${id}"]`)?.remove();

    }

});

// Reminder tokens.

tokenObserver.on("character-add", ({ detail }) => {

    const character = detail.character;

    if (character.getTeam() !== "fabled") {
        return;
    }

    character.getReminders().forEach((reminder) => {
        lookupOneCached("#reminder-list__list").append(reminder.drawList());
    });

});

tokenObserver.on("character-remove", ({ detail }) => {

    const character = detail.character;
    const count = fabledCount[character.getId()];

    if (character.getTeam() !== "fabled" || count) {
        return;
    }

    character.getReminders().forEach((reminder) => {

        lookupOne(
            `[data-reminder-id="${reminder.getId()}"]`,
            lookupOneCached("#reminder-list__list")
        )?.remove();

    });

});
