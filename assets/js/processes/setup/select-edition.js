import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import {
    lookup,
    lookupOne,
    lookupOneCached,
    getLabelText
} from "../../utils/elements.js";

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

function announceScript(name, characters) {

    Observer.create("game").trigger("characters-selected", {
        name,
        characters
    });
    Dialog.create(lookupOneCached("#edition-list")).hide();

}

const form = lookupOne("#select-edition-form");
const fileInput = lookupOne("#custom-script");
const fileInputRender = fileInput.nextElementSibling;
const uploader = lookupOne("#custom-script-upload");
const radios = lookup("[name=\"edition\"]", form);

radios.forEach((radio) => {

    radio.addEventListener("input", ({ target }) => {

        const isCustom = target.value === "custom";

        uploader.hidden = !isCustom;
        fileInput.required = isCustom;

    });

});

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const radio = radios.find(({ checked }) => checked);
    const edition = radio?.value;

    if (!edition) {
        return;
    }

    TokenStore.ready(({ characters }) => {

        if (edition === "custom") {

            const reader = new FileReader();

            reader.addEventListener("load", ({ target }) => {

                const json = JSON.parse(target.result);

                if (!isScriptJson(json)) {

                    fileInput.setCustomValidity(
                        fileInput.dataset.invalidScript
                    );
                    form.reportValidity();
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
                announceScript(
                    name,
                    json
                        .map(({ id }) => characters[id.replace(/[-_]/g, "")])
                        .filter(Boolean)
                );

            });

            reader.readAsBinaryString(fileInput.files[0]);

        } else {

            announceScript(
                getLabelText(radio),
                Object.values(characters)
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

});
