import Bluffs from "../../classes/Bluffs.js";
import {
    lookupOne,
    lookupCached,
    lookupOneCached
} from "../../utils/elements.js";

lookupOne("#reset-height").addEventListener("click", () => {
    lookupOneCached(".js--pad").style.height = "";
});

const pad = lookupOneCached(".js--pad").pad;
const bluffs = Bluffs.get();

lookupOne("#clear-grimoire").addEventListener("click", ({ target }) => {

    if (window.confirm(target.dataset.confirm)) {

        pad.reset();
        bluffs.reset();

    }

});
