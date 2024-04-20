import Observer from "../classes/Observer.js";
import NightOrder from "../classes/NightOrder.js";
import {
    empty,
    lookupOne,
    lookupOneCached,
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");
const nightOrder = new NightOrder();
nightOrder.redraw = () => {

    empty(lookupOneCached("#first-night")).append(nightOrder.drawNightOrder(true));
    empty(lookupOneCached("#other-nights")).append(nightOrder.drawNightOrder(false));

};

gameObserver.on("characters-selected", ({ detail }) => {

    nightOrder.reset();
    nightOrder.setCharacters(detail.characters);

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

lookupOne("#show-all").addEventListener("change", ({ target }) => {

    const showAll = target.checked;

    nightOrder.setShowNotInPlay(showAll);
    gameObserver.trigger("night-order-show-all", {
        showAll
    });

});

lookupOne("#show-dead").addEventListener("change", ({ target }) => {

    const showDead = target.checked;

    nightOrder.setShowDead(showDead);
    gameObserver.trigger("night-order-show-dead", {
        showDead
    });

});
