import Observer from "../../classes/Observer.js";
import Template from "../../classes/Template.js";
import Dialog from "../../classes/Dialog.js";
import TokenStore from "../../classes/TokenStore.js";
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

// Include all the Travellers in the traveller list.

const officialTravellers = Object.create(null);
const homebrewTravellers = Object.create(null);
let characterTemplate = null;

function populateTravellers() {

    const travellers = Object.values({
        ...officialTravellers,
        ...homebrewTravellers
    });

    if (!characterTemplate) {

        characterTemplate = Template.create(
            lookupOneCached("#character-list-template")
        );

    }

    replaceContentsMany(
        lookupOneCached("#traveller-list__list"),
        travellers.map((traveller) => characterTemplate.draw({
            ".js--character-list--item,.js--character-list--button"(element) {
                element.dataset.tokenId = traveller.getId();
            },
            ".js--character-list--token"(element) {
                element.append(traveller.drawToken());
            }
        }))
    );

    lookupOneCached("#add-traveller").disabled = false;

}

TokenStore.ready((tokenStore) => {

    empty(officialTravellers);

    tokenStore
        .getAllCharacters()
        .filter((character) => character.getTeam() === "traveller")
        .forEach((traveller) => officialTravellers[traveller.getId()] = traveller);

    populateTravellers();

});

gameObserver.on("characters-selected", ({ detail }) => {

    // Add any homebrew characters to the list.

    empty(homebrewTravellers);

    detail.characters
        .filter((character) => character.getTeam() === "traveller")
        .forEach((traveller) => homebrewTravellers[traveller.getId()] = traveller);

    populateTravellers();

    // Flag Travellers in the script as being included. For example, the main 3
    // editions have Travellers that complement the script. Homebrew scripts
    // maight have their own Travellers as well.

    const travellerIDs = detail.characters
        .filter((character) => character.getTeam() === "traveller")
        .map((character) => character.getId());

    lookup(
        ".js--character-list--item[data-token-id]",
        lookupOneCached("#traveller-list__list")
    ).forEach((item) => item.classList.toggle(
        "is-included",
        travellerIDs.includes(item.dataset.tokenId)
    ));

});

// Add to the grimoire when clicked.

const pad = lookupOneCached(".js--pad").pad;

lookupOneCached("#traveller-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-token-id]");

    if (!button) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        pad.addCharacter(tokenStore.getCharacter(button.dataset.tokenId));
        Dialog.create(lookupOneCached("#traveller-list")).hide();

    });

});

// Night Order.

const travellerCount = Object.create(null);

tokenObserver.on("character-add", ({ detail }) => {

    const character = detail.character;

    if (character.getTeam() !== "traveller") {
        return;
    }

    const id = character.getId();

    if (!travellerCount[id]) {
        travellerCount[id] = 0;
    }

    travellerCount[id] += 1;

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

    if (character.getTeam() !== "traveller") {
        return;
    }

    const id = character.getId();

    if (travellerCount[id]) {
        travellerCount[id] -= 1;
    }

    if (!travellerCount[id]) {

        lookupOne(`#first-night [data-id="${id}"]`)?.remove();
        lookupOne(`#other-nights [data-id="${id}"]`)?.remove();

    }

});

// Reminder tokens.

tokenObserver.on("character-add", ({ detail }) => {

    const character = detail.character;

    if (character.getTeam() !== "traveller") {
        return;
    }

    character.getReminders().forEach((reminder) => {
        lookupOneCached("#reminder-list__list").append(reminder.drawList());
    });

});

tokenObserver.on("character-remove", ({ detail }) => {

    const character = detail.character;
    const count = travellerCount[character.getId()];

    if (character.getTeam() !== "traveller" || count) {
        return;
    }

    character.getReminders().forEach((reminder) => {

        lookupOne(
            `[data-reminder-id="${reminder.getId()}"]`,
            lookupOneCached("#reminder-list__list")
        )?.remove();

    });

});
