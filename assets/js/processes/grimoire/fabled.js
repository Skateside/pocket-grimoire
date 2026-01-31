import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import Template from "../../classes/Template.js";
import {
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
const homebrewLoric = Object.create(null);
const officialLoric = Object.create(null);
let characterTemplate = null;

function populateFabled() {

    const fabled = Object.values({...officialFabled, ...homebrewFabled});
    const loric = Object.values({...officialLoric, ...homebrewLoric});

    if (!characterTemplate) {

        characterTemplate = Template.create(
            lookupOneCached("#character-list-template")
        );

    }

    const contents = [
        ...fabled.map((fable) => characterTemplate.draw({
            ".js--character-list--item,.js--character-list--button"(element) {
                element.dataset.tokenId = fable.getId();
            },
            ".js--character-list--token"(element) {
                element.append(fable.drawToken());
            }
        })),
        ...loric.map((lor) => characterTemplate.draw({
            ".js--character-list--item,.js--character-list--button"(element) {
                element.dataset.tokenId = lor.getId();
            },
            ".js--character-list--token"(element) {
                element.append(lor.drawToken());
            }
        })),
    ];

    replaceContentsMany(lookupOneCached("#fabled-list__list"), contents);
    lookupOneCached("#add-fabled").disabled = false;

}

gameObserver.on("characters-selected", ({ detail }) => {

    empty(homebrewFabled);
    empty(homebrewLoric);

    detail.characters
        .filter((character) => character.getTeam() === "fabled")
        .forEach((character) => homebrewFabled[character.getId()] = character);
    detail.characters
        .filter((character) => character.getTeam() === "loric")
        .forEach((character) => homebrewLoric[character.getId()] = character);

    populateFabled();

});

TokenStore.ready((tokenStore) => {

    empty(officialFabled);
    empty(officialLoric);

    tokenStore
        .getAllCharacters()
        .filter((character) => character.getTeam() === "fabled")
        .forEach((character) => officialFabled[character.getId()] = character);
    tokenStore
        .getAllCharacters()
        .filter((character) => character.getTeam() === "loric")
        .forEach((character) => officialLoric[character.getId()] = character);

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
// #155 - Let the NightOrder class manage the night order.

const fabledCount = Object.create(null);
const loricCount = Object.create(null);

tokenObserver.on("character-add", ({ detail }) => {

    const character = detail.character;

    if (character.getTeam() === "fabled") {

        const id = character.getId();
    
        if (!fabledCount[id]) {
            fabledCount[id] = 0;
        }
    
        fabledCount[id] += 1;

    }

    if (character.getTeam() === "loric") {

        const id = character.getId();
    
        if (!loricCount[id]) {
            loricCount[id] = 0;
        }
    
        loricCount[id] += 1;

    }

});

tokenObserver.on("character-remove", ({ detail }) => {

    const character = detail.character;

    if (character.getTeam() !== "fabled") {

        const id = character.getId();
    
        if (fabledCount[id]) {
            fabledCount[id] -= 1;
        }

    }

    if (character.getTeam() !== "loric") {

        const id = character.getId();
    
        if (loricCount[id]) {
            loricCount[id] -= 1;
        }

    }

});

// Reminder tokens.

tokenObserver.on("character-add", ({ detail }) => {

    const character = detail.character;
    const team = character.getTeam();

    if (team !== "fabled" && team !== "loric") {
        return;
    }

    character.getReminders().forEach((reminder) => {
        lookupOneCached("#reminder-list__list").append(reminder.drawList());
    });

});

tokenObserver.on("character-remove", ({ detail }) => {

    const character = detail.character;
    const id = character.getId();
    const team = character.getTeam();
    const fCount = fabledCount[id];
    const lCount = loricCount[id];

    if ((team === "fabled" && !fCount) || (team === "loric" && !lCount)) {

        character.getReminders().forEach((reminder) => {

            lookupOne(
                `[data-reminder-id="${reminder.getId()}"]`,
                lookupOneCached("#reminder-list__list")
            )?.remove();

        });

    }

});
