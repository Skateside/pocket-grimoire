import Observer from "../classes/Observer.js";
import NightOrder from "../classes/NightOrder.js";
import {
    empty,
    lookupOne,
    lookupOneCached,
    announceInput,
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");
const nightOrder = new NightOrder();

gameObserver.on("characters-selected", ({ detail }) => {

    nightOrder.reset();
    nightOrder.setCharacters(detail.characters);
    empty(lookupOneCached("#first-night")).append(nightOrder.drawNightOrder(true));
    empty(lookupOneCached("#other-nights")).append(nightOrder.drawNightOrder(false));

});

tokenObserver.on("character-add", ({ detail }) => {
    nightOrder.addCharacter(detail.character);
});

tokenObserver.on("character-remove", ({ detail }) => {
    nightOrder.removeCharacter(detail.character);
});

tokenObserver.on("shroud-toggle", ({ detail }) => {
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
