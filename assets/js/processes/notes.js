import {
    lookupOne,
    announceInput
} from "../utils/elements.js";

const button = lookupOne("#clear-st-notes");
const field = lookupOne("#st-notes");

button.addEventListener("click", () => {

    if (window.confirm(button.dataset.warning)) {

        field.value = "";
        announceInput(field);

    }

});
