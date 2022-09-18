import Observer from "../classes/Observer.js";
import {
    addCustomInfoToken
} from "../classes/InfoTokens.js";
import {
    lookupOne
} from "../utils/elements.js";

const infoTokenObserver = Observer.create("info-token");

lookupOne("#add-info-token").addEventListener("click", ({ target }) => {

    var text = prompt("What do you want your new info token to say? Use **double asterisks** to emphasise text.");
    addCustomInfoToken(text);
    infoTokenObserver.trigger("add-info-token", {
        text
    });

});
