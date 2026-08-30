import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import Template from "../../classes/Template.js";
import {
    lookupOne,
    lookupOneCached,
    getLabelText,
    replaceContentsMany,
} from "../../utils/elements.js";
import {
    supplant
} from "../../utils/strings.js";
import {
    get,
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
 * @param {Object} meta
 *        Meta entry for the script. This might be null.
 * @param {Array.<Object>} characters
 *        Characters in the script.
 * @param {String|null} [game=null]
 *        The ID of the homebrew script that was uploaded. This will be null for
 *        a game that only consists of recognised characters.
 */
function announceScript(meta, characters, game = null) {

    Observer.create("game").trigger("characters-selected", {
        meta,
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
            entry.image = `/build/img/roles/generic/${entry.team}.png`;
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

    let meta = null; 
    const metaIndex = json.findIndex(({ id }) => id === "_meta");

    if (metaIndex > -1) {

        meta = json[metaIndex];
        json.splice(metaIndex, 1);

    }

    return meta;

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

    if (
        form.dataset.isLoading === state
        || String(form.dataset.isLoading) === String(state)
    ) {
        return;
    }

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

    return TokenStore.normaliseId(id);

}

/**
 * Removes the "Randomizer" loric that random-botc-script.com adds. The loric
 * makes the script look like homebrew, filling up the database for no benefit.
 *
 * @param  {Array} json
 *         Items to look through to potentially remove the Randomizer loric.
 * @return {Array}
 *         Previous items but without the Randomizer loric.
 */
function removeRandomizer(json) {
    return json.filter((role) => {
        if (typeof role !== "object" || typeof role.ability !== "string") {
            return true;
        }

        if (
            role.id === "randomizer"
            && role.team === "loric"
            && role.ability.includes("https://random-botc-script.com")
        ) {
            return false;
        }

        return true;
    });
}

/**
 * Processes the JSON to set up the game.
 *
 * @param  {Object} json
 *         JSON to process.
 * @param  {Element} json.form
 *         The form that was submitted so the JSON could be processed.
 * @param  {Array.<Object>} json.json
 *         Script to process.
 * @param  {Element} json.input
 *         File input that uploads scripts.
 * @param  {TokenStore} json.store
 *         Store for any data.
 * @return {Promise}
 *         An empty, resolved Promise.
 */
function processJSON({
    form,
    json,
    input,
    store
}) {
    if (!isScriptJson(json)) {
        showInputError(input, I18N.invalidScript);
        return Promise.resolve();
    }

    json = removeRandomizer(json);

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

    const meta = extractMetaEntry(json);
    const characters = json
        .map((item) => store.getCharacter(convertCharacterId(item)))
        .filter(Boolean);

    if (!characters.length) {
        showInputError(input, I18N.noCharacters);

        return Promise.resolve();
    }

    announceScript(meta, characters);

    return Promise.resolve();
}

const botcInput = lookupOne("#botc-scripts");
const botcLookup = lookupOne("#botc-scripts-lookup");
const botcLoader = lookupOne("#botc-scripts-loader");
const botcEmpty = lookupOne("#botc-scripts-empty");
const botcResults = lookupOne("#botc-scripts-results");
const botcTemplate = Template.create(lookupOne("#botc-scripts-entry"));
const botcScripts = Object.create(null);

/**
 * Sets the BotC Script results.
 *
 * @param {Array} scripts Collection of BotC Script results that can be stored
 *        and referenced.
 */
function setBotcScripts(scripts) {
    Object.keys(botcScripts).forEach((key) => {
        delete botcScripts[key];
    });

    scripts.forEach(({ id, script }) => {
        botcScripts[id] = script;
    });
}

botcLookup.addEventListener("click", () => {
    botcResults.hidden = true;

    const term = botcInput.value.trim();

    if (term === "") {
        return;
    }

    botcLoader.hidden = false;

    const myURL = supplant(window.decodeURIComponent(URLS.botc), { term });
    setFormLoadingState(form, false);
    get(myURL)
        .catch(() => {
            showInputError(botcInput, I18N.invalidScript);
            setFormLoadingState(form, false);
            return null;
        })
        .then((json) => {
            botcLoader.hidden = true;

            if (json === null) {
                return;
            }

            if (!json.success) {
                showInputError(botcInput, json.message);
                setFormLoadingState(form, false);
                return;
            }

            if (!json.data.length) {
                botcEmpty.hidden = false;
                return;
            }

            setBotcScripts(json.data);
            replaceContentsMany(
                botcResults,
                json.data.map((data, index) => botcTemplate.draw({
                    ".js--botc-scripts--label"(element) {
                        element.htmlFor = `botc-script-${data.id}`;
                    },
                    ".js--botc-scripts--input"(element) {
                        element.value = data.id;
                        element.id = `botc-script-${data.id}`;

                        if (index === 0) {
                            element.required = true;
                        }
                    },
                    ".js--botc-scripts--name"(element) {
                        element.textContent = data.name;
                    },
                    ".js--botc-scripts--author"(element) {
                        element.textContent = `${data.author} (${data.version})`;
                    },
                })),
            );
            botcResults.hidden = false;
        });
});

const form = lookupOne("#select-edition-form");
const sections = form.querySelectorAll(".edition-details[data-id]");

sections.forEach((section) => {
    section.querySelectorAll("input,select,textarea,button").forEach((element) => {
        element.disabled = !section.open;
    });
});

form.addEventListener("toggle", ({ target, newState }) => {
    target.querySelectorAll("input,select,textarea,button").forEach((element) => {
        element.disabled = (newState === "closed");
    });
}, { capture: true });

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (form.dataset.isLoading === "true") {
        return;
    }

    const openSection = Array.prototype.find.call(sections, ({ open }) => open);
    const mode = openSection?.dataset.id;
    const data = new FormData(form);

    if (!mode) {
        throw new Error("Unable to detect open section");
    }

    TokenStore.ready((tokenStore) => {
        switch (mode) {
            case "official": {
                const edition = data.get("edition");
                const radio = lookupOneCached(`input[name="edition"][value="${edition}"]`, form);
                const meta = { name: getLabelText(radio) };
                const rawMeta = window.PG.scripts[edition]?.find(({ id }) => {
                    return id === "_meta";
                });

                if (rawMeta) {
                    Object.assign(meta, rawMeta);
                }

                announceScript(meta, tokenStore.getScript(edition));

                break;
            }

            case "upload": {
                const fileInput = lookupOneCached("#custom-script-upload");
                const reader = new FileReader();

                reader.addEventListener("load", ({ target }) => {

                    let json = [];

                    try {
                        json = JSON.parse(target.result);
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

                break;
            }

            case "url": {
                const urlInput = lookupOneCached("#custom-script-url");

                setFormLoadingState(form, true);

                const myURL = supplant(window.decodeURIComponent(URLS.url), {
                    url: window.encodeURIComponent(urlInput.value)
                });

                get(myURL)
                    .catch(() => {
                        showInputError(urlInput, I18N.invalidScript);
                        setFormLoadingState(form, false);
                        return null;
                    })
                    .then((json) => {

                        if (json === null) {
                            return;
                        }

                        if (!json.success) {
                            showInputError(urlInput, json.message);
                            setFormLoadingState(form, false);
                            return;
                        }

                        processJSON({
                            form,
                            json: json.data,
                            input: urlInput,
                            store: tokenStore
                        }).then(() => setFormLoadingState(form, false));

                    });

                break;
            }

            case "paste": {
                const pasteInput = lookupOneCached("#custom-script-paste");
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
                });

                break;
            }

            case "botc": {
                const scriptId = data.get("botc-script");
                const json = botcScripts[scriptId];

                if (!json) {
                    return showInputError(botcInput, "Unrecognised script");
                }

                processJSON({
                    form,
                    json,
                    input: botcInput,
                    store: tokenStore,
                });

                break;
            }
        }
    });
});
