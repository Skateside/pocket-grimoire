import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import {
    lookupOneCached
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");

lookupOneCached("#edition-list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-edition]");

    if (!button) {
        return;
    }

    const {
        edition
    } = button.dataset;
    const name = button.textContent.trim();

    TokenStore.ready(({ characters }) => {

        const filtered = Object
            .values(characters)
            .filter((character) => character.getEdition() === edition);

        gameObserver.trigger("characters-selected", {
            name,
            characters: filtered
        });
        Dialog.create(lookupOneCached("#edition-list")).hide();

    });

});
