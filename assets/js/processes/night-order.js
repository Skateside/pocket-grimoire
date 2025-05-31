import Observer from "../classes/Observer.js";
import NightOrder from "../classes/NightOrder.js";
import {
    lookupOne,
    lookupOneCached,
    announceInput,
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");
const nightOrder = new NightOrder();

nightOrder.setHolders({
    first: lookupOneCached("#first-night"),
    other: lookupOneCached("#other-nights")
});

gameObserver.on("characters-selected", ({ detail }) => {

    nightOrder.reset();
    nightOrder.setCharacters(
        detail.characters
            .filter((character) => !["fabled", "traveller"].includes(character.getTeam()))
    );
    nightOrder.drawAllNightOrders();

});

// #145 - Show the "First Night" order after clearing the grimoire.
gameObserver.on("clear", () => {
    lookupOneCached(".js--night-order--carousel").scrollLeft = 0;
});

// TODO: Travellers and Fabled should be unique, it should only be possible to
// add 1 of each. Add that limitation so we don't need to count them anymore.
const specialRoles = {
    fabled: Object.create(null),
    traveller: Object.create(null)
}

tokenObserver.on("character-add", ({ detail }) => {

    const {
        character
    } = detail;
    const team = character.getTeam();

    // #155 - If we have a traveller or a fabled, add it to the night order.
    if (specialRoles[team]) {

        const id = character.getId();

        if (!specialRoles[team][id]) {
            specialRoles[team][id] = 0;
        }

        specialRoles[team][id] += 1;

        nightOrder.setCharacter(character);
        nightOrder.placeInOrder(character);

    }

    // #131 - check the character isn't from the previous script.
    if (!nightOrder.hasCharacter(character)) {
        return;
    }

    nightOrder.addCharacter(character);

});

tokenObserver.on("character-remove", ({ detail }) => {

    const {
        character
    } = detail;
    const team = character.getTeam();

    // #155 - If we're removing a fabled or traveller, remove them if necessary.
    if (specialRoles[team]) {

        const id = character.getId();

        if (specialRoles[team][id]) {

            specialRoles[team][id] -= 1;

            if (specialRoles[team][id] <= 0) {

                nightOrder.unsetCharacter(character);
                delete specialRoles[team][id];

            }

        }

    }

    // #131 - check the character isn't from the previous script.
    if (!nightOrder.hasCharacter(character)) {
        return;
    }

    nightOrder.removeCharacter(character);

});

tokenObserver.on("shroud-toggle", ({ detail }) => {

    // #131 - check the character isn't from the previous script.
    if (!nightOrder.hasCharacter(detail.character)) {
        return;
    }

    nightOrder.toggleDead(detail.character, detail.isDead);

});

const showDead = lookupOne("#show-dead");

showDead.addEventListener("change", ({ target }) => {

    const showDead = target.checked;

    nightOrder.setShowDead(showDead);
    gameObserver.trigger("night-order-show-dead", {
        showDead
    });

});

lookupOne("#show-all").addEventListener("change", ({ target }) => {

    const showAll = target.checked;

    nightOrder.setShowNotInPlay(showAll);
    gameObserver.trigger("night-order-show-all", {
        showAll
    });

    // Showing all characters not in play but hiding the dead can seem
    // confusing. This forces "show dead" to be true when showing all, although
    // the user can hide the dead seperately.
    if (showAll && !showDead.checked) {

        showDead.checked = true;
        announceInput(showDead);

    }

});
