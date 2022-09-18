import {
    lookupOne
} from "../utils/elements.js";

const detailsPlayerMsgs = lookupOne("details#player-msgs");
const textBoxPlayerMsgs = lookupOne("textarea", detailsPlayerMsgs);

lookupOne("#clear-player-msgs", detailsPlayerMsgs).addEventListener("click", ({ target }) => {

    textBoxPlayerMsgs.value = "";
    textBoxPlayerMsgs.dispatchEvent(new Event('change'));

});
