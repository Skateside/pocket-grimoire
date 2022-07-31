import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import {
    lookup,
    lookupOne,
    lookupOneCached,
    getLabelText,
    announceInput
} from "../../utils/elements.js";
import {
    readUTF8
} from "../../utils/strings.js";

/**
 * Checks to see if the given data looks like a script.
 *
 * @param  {Array.<Object>} json
 *         Data to check.
 * @return {Boolean}
 *         true if the data looks like a script, false if it doesn't.
 */
function isScriptJson(json) {

    return (
        Array.isArray(json)
        && json.length
        && json.every((item) => (
            typeof item === "object"
            && typeof item?.id === "string"
        ))
    );

}

/**
 * Announces that a script has been added to the grimoire.
 *
 * @param {String} name
 *        Name of the script. This may be an empty string.
 * @param {Array.<Object>} characters
 *        Characters in the script.
 */
function announceScript(name, characters) {

    Observer.create("game").trigger("characters-selected", {
        name,
        characters
    });
    Dialog.create(lookupOneCached("#edition-list")).hide();

}

/**
 * Shows the given error message on the given input.
 *
 * @param {Element} input
 *        Element that should show an error.
 * @param {String} error
 *        Error message to show.
 */
function showInputError(input, error) {

    input.setCustomValidity(error);
    input.form.reportValidity();

}

/**
 * Processes the JSON to set up the game.
 *
 * @param {Object} json
 *        JSON to process.
 * @param {Array.<Object>} json.json
 *        Script to process.
 * @param {Element} json.input
 *        File input that uploads scripts.
 * @param {TokenStore} json.store
 *        Store for any data.
 */
function processJSON({
    json,
    input,
    store
}) {

    if (!isScriptJson(json)) {

        showInputError(input, lookupOneCached("#invalid-script").textContent);
        return;

    }

    let name = "";
    const metaIndex = json.findIndex(({ id }) => id === "_meta");

    if (metaIndex > -1) {

        name = json[metaIndex].name;
        json.splice(metaIndex, 1);

    }

    // The script tool creates IDs differently from our data.
    // Examples: script = lil_monsta, data = lilmonsta
    // Examples: script = al-hadikhia, data = alhadikhia
    // The .replace() here is designed to convert their IDs to ours.
    const characters = json.map((item) => (
        store.getCharacter(item.id.replace(/[-_]/g, ""))
        || store.createCustomCharacter(item)
    ));

    if (!characters.length) {

        showInputError(input, lookupOneCached("#no-characters").textContent);
        return;

    }

    announceScript(name, characters);

}

const form = lookupOne("#select-edition-form");
const fileInput = lookupOne("#custom-script-upload");
const fileInputRender = fileInput.nextElementSibling;
const urlInput = lookupOne("#custom-script-url");
const uploader = lookupOne("#custom-script");
const radios = lookup("[name=\"edition\"]", form);

radios.forEach((radio) => {

    radio.addEventListener("input", ({ target }) => {

        const isCustom = target.value === "custom";

        uploader.hidden = !isCustom;
        fileInput.required = isCustom;
        urlInput.required = isCustom;

    });

    fileInput.addEventListener("input", () => {
        urlInput.required = !fileInput.value;
    });

    urlInput.addEventListener("input", () => {
        fileInput.required = !urlInput.value;
    });

});

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const radio = radios.find(({ checked }) => checked);
    const edition = radio?.value;

    if (!edition) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        if (edition === "custom") {

            if (urlInput.value) {

                fetch(urlInput.value)
                    .catch((error) => showInputError(urlInput, error.message))
                    .then((response) => response.json())
                    .then((json) => processJSON({
                        json,
                        input: urlInput,
                        store: tokenStore
                    }));

            } else if (fileInput.files.length) {

                const reader = new FileReader();

                reader.addEventListener("load", ({ target }) => processJSON({
                    json: JSON.parse(readUTF8(target.result)),
                    input: fileInput,
                    store: tokenStore
                }));

                reader.readAsBinaryString(fileInput.files[0]);

            }

        } else {

            announceScript(
                getLabelText(radio),
                tokenStore
                    .getAllCharacters()
                    .filter((character) => character.getEdition() === edition)
            );

        }

    });

});

fileInput.addEventListener("input", () => {

    const {
        value
    } = fileInput;

    fileInput.setCustomValidity("");
    fileInputRender.dataset.value = (
        value
        ? value.slice(value.lastIndexOf("\\") + 1)
        : fileInputRender.dataset.placeholder
    );

    if (value && urlInput.value) {

        urlInput.value = "";
        announceInput(urlInput);

    }

});

urlInput.addEventListener("input", () => {

    urlInput.setCustomValidity("");

    if (urlInput.value && fileInput.value) {

        fileInput.value = "";
        announceInput(fileInput);

    }

});
