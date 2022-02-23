import Observer from "../../classes/Observer.js";
import {
    lookupOne,
    lookupOneCached
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");

lookupOne("#reset-height").addEventListener("click", () => {
    lookupOneCached(".js--pad").style.height = "";
});

lookupOne("#clear-grimoire").addEventListener("click", ({ target }) => {

    if (window.confirm(target.dataset.confirm)) {
        gameObserver.trigger("clear");
    }

});
