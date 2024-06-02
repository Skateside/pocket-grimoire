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
import {
    post
} from "../../utils/fetch.js";

/**
 * Checks to see if the given data looks like a script.
 *
 * @param  {Array.<Object|String>} json
 *         Data to check.
 * @return {Boolean}
 *         true if the data looks like a script, false if it doesn't.
 */
function isScriptJson(json) {

    return (
        Array.isArray(json)
        && json.length
        && json.every((item) => (
            (
                typeof item === "object"
                && typeof item?.id === "string"
            )
            || typeof item === "string"
        ))
    );

}

/**
 * Checks to see if the given json looks like it contains any homebrew content.
 *
 * @param  {Array.<Object>} json
 *         Data to check.
 * @return {Boolean}
 *         true if the data seems to contain any homebrew, false if it doesn't
 *         seem to contain any homebrew.
 */
function containsHomebrew(json) {

    return json
        .filter(({ id }) => id !== "_meta")
        .some(({ ability }) => typeof ability === "string");

}

/**
 * Announces that a script has been added to the grimoire.
 *
 * @param {String} name
 *        Name of the script. This may be an empty string.
 * @param {Array.<Object>} characters
 *        Characters in the script.
 * @param {String|null} [game=null]
 *        The ID of the homebrew script that was uploaded. This will be null for
 *        a game that only consists of recognised characters.
 */
function announceScript(name, characters, game = null) {

    Observer.create("game").trigger("characters-selected", {
        name,
        characters,
        game
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

// A map of any common mistakes that we find in the homebrew code.
const normalMap = {
    team: {
        // The American spelling has one L, but I'm British and I use two L's.
        "traveler": "traveller"
    }
};

/**
 * Fixes any common mistakes in the homebrew code.
 *
 * @param  {Array} json
 *         Homebrew JSON.
 * @return {Array}
 *         The homebrew JSON, mapped so that it works with our system.
 */
function normaliseHomebrew(json) {

    return json.map((entry) => {

        // An official character may be a simple string rather than the
        // old-school approach of an object with an "id" key.
        if (typeof entry === "string") {
            entry = { id: entry };
        }

        Object.entries(normalMap).forEach(([key, map]) => {
            entry[key] = map[entry[key]] || entry[key];
        });

        if (Array.isArray(entry.image)) {
            entry.image = entry.image[0];
        }

        if (entry.team && !entry.image) {
            entry.image = `/build/img/icons/${entry.team}.png`;
        }

        return entry;

    });

}

/**
 * Removes the "_meta" entry from the given JSON data, if it exists, and returns
 * the name within that entry. If the entry isn't found, an empty string is
 * returned.
 *
 * @param  {Array.<Object>} json
 *         JSON data whose "_meta" entry should be removed.
 * @return {String}
 *         Name of the script, taking from the "_meta" entry, or an empty string
 *         if the name cannot be found.
 */
function extractMetaEntry(json) {

    let name = "";
    const metaIndex = json.findIndex(({ id }) => id === "_meta");

    if (metaIndex > -1) {

        name = json[metaIndex].name;
        json.splice(metaIndex, 1);

    }

    return name;

}

/**
 * Sets the loading state of the form, setting the state of the loading
 * animation in the submit button.
 *
 * @param {Element} form
 *        Form whose loading state should be set.
 * @param {Boolean} state
 *        true if the form is loading, false if it's not.
 */
function setFormLoadingState(form, state) {

    form.dataset.isLoading = state;

    const submit = lookupOneCached("[type=\"submit\"]", form);
    submit.classList.toggle("is-loading", state);

    const progress = lookupOneCached("[role=\"progressbar\"]", submit);
    progress.setAttribute("aria-busy", state);
    progress.setAttribute(
        "aria-valuenow",
        (
            state
            ? "0"
            : progress.getAttribute("aria-valuemax")
        )
    );

}

/**
 * Converts a character entry into a normalised ID.
 *
 * @param  {Object|String} item
 *         Item whose normalised ID should be returned.
 * @return {String}
 *         Normalised character ID.
 */
function convertCharacterId(item) {

    let id = "";

    if (typeof item === "string") {
        id = item;
    } else if (item && typeof item === "object") {
        id = item.id || "";
    }

    // The script tool creates IDs differently from our data.
    // Examples: script = lil_monsta, data = lilmonsta
    // Examples: script = al-hadikhia, data = alhadikhia
    // The .replace() here is designed to convert their IDs to ours.
    return id.replace(/[-_]/g, "")

}

/**
 * Processes the JSON to set up the game.
 *
 * @param {Object} json
 *        JSON to process.
 * @param {Element} json.form
 *        The form that was submitted so the JSON could be processed.
 * @param {Array.<Object>} json.json
 *        Script to process.
 * @param {Element} json.input
 *        File input that uploads scripts.
 * @param {TokenStore} json.store
 *        Store for any data.
 */
function processJSON({
    form,
    json,
    input,
    store
}) {

    if (!isScriptJson(json)) {

        showInputError(input, I18N.invalidScript);
        return;

    }

    if (containsHomebrew(json)) {

        const normalised = normaliseHomebrew(json);

        setFormLoadingState(form, true);

        return post(URLS.homebrew, normalised)
            .then(({ success, game, message, reasons }) => {

                setFormLoadingState(form, false);

                if (success) {

                    announceScript(
                        extractMetaEntry(normalised),
                        normalised.map((item) => (
                            store.getOfficialCharacter(convertCharacterId(item))
                            || store.createCustomCharacter(item)
                        )),
                        game
                    );
                    Dialog.create(lookupOneCached("#edition-list")).hide();

                } else {

                    if (reasons && reasons.length) {
                        message += "\n\n" + reasons.join("\n");
                    }

                    showInputError(input, message);

                }

        });

    }

    const name = extractMetaEntry(json);
    const characters = json
        .map((item) => store.getCharacter(convertCharacterId(item)))
        .filter(Boolean);

    if (!characters.length) {

        showInputError(input, I18N.noCharacters);
        return;

    }

    announceScript(name, characters);

}

/**
 * Sets the validation on the given fields.
 *
 * @param {Array.<Element>} fields
 *        Input fields that should have their validity set.
 * @param {Boolean} isVisible
 *        true if the fields are visible and their validity should be set, false
 *        if they're not visible and their validity should be removed.
 */
function setFieldsValidity(fields, isVisible) {

    if (isVisible) {

        const inputted = fields.find((field) => field.value);
        fields.forEach((field) => {
            field.required = !inputted || field === inputted;
        });

    } else {

        fields.forEach((field) => {

            field.setCustomValidity("");
            field.required = false;

        });

    }

}

const form = lookupOne("#select-edition-form");
const fileInput = lookupOne("#custom-script-upload");
const fileInputRender = fileInput.nextElementSibling;
const urlInput = lookupOne("#custom-script-url");
const pasteInput = lookupOne("#custom-script-paste");
const uploader = lookupOne("#custom-script");
const radios = lookup("[name=\"edition\"]", form);
const customInputs = [fileInput, urlInput, pasteInput];

radios.forEach((radio) => {

    radio.addEventListener("input", ({ target }) => {

        const isCustom = target.value === "custom";

        uploader.hidden = !isCustom;
        setFieldsValidity(customInputs, isCustom);

    });

});

customInputs.forEach((input) => {

    input.addEventListener("input", () => {

        input.setCustomValidity("");
        setFieldsValidity(customInputs, true);

    });

});

form.addEventListener("submit", (e) => {

    e.preventDefault();

    if (form.dataset.isLoading === "true") {
        return;
    }

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
                    .catch(() => {
                        showInputError(urlInput, I18N.invalidScript)
                        return [];
                    })
                    .then((json) => processJSON({
                        form,
                        json,
                        input: urlInput,
                        store: tokenStore
                    }));

            } else if (fileInput.files.length) {

                const reader = new FileReader();

                // 1. Accented characters were getting mangled. This fix allows
                //    them to be included. Noticed when trying to upload a
                //    homebrew Spanish script.

                reader.addEventListener("load", ({ target }) => {

                    let json = [];

                    try {
                        json = JSON.parse(readUTF8(target.result)); // [1]
                    } catch (error) {
                        return showInputError(fileInput, I18N.invalidScript);
                    }

                    processJSON({
                        form,
                        json,
                        input: fileInput,
                        store: tokenStore
                    })

                });

                reader.readAsText(fileInput.files[0]);

            } else if (pasteInput.value) {

                let json = [];

                try {
                    json = JSON.parse(pasteInput.value);
                } catch (error) {
                    return showInputError(pasteInput, I18N.invalidScript);
                }

                processJSON({
                    form,
                    json,
                    input: pasteInput,
                    store: tokenStore
                })

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

Dialog.create(lookupOne("#edition-list")).on(Dialog.HIDE, () => {

    fileInput.value = "";
    announceInput(fileInput);
    urlInput.value = "";
    announceInput(urlInput);

});
