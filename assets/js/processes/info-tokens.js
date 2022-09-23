import Template from "../classes/Template.js";
import {
    lookupOne,
    lookupOneCached
} from "../utils/elements.js";
import {
    random
} from "../utils/numbers.js";
import {
    striptags
} from "../utils/strings.js";

const buttonTemplate = Template.create(lookupOne("#info-token-button-template"));
const dialogTemplate = Template.create(lookupOne("#info-token-dialog-template"));
const buttonHolder = lookupOne("#info-token-button-holder");
const customHolder = lookupOne("#info-token-custom-holder");
const dialogHolder = lookupOne("#info-token-dialog-holder");

JSON.parse(buttonHolder.dataset.infoTokens).forEach((data) => drawToken(data));

const idCache = Object.create(null);

function makeId(text) {

    if (!idCache[text]) {

        idCache[text] = (
            text.replace(/\W/g, "").toLowerCase()
            + "-"
            + String(random()).replace(/\D/g, "")
        );

    }

    return idCache[text];

}

function interpret({ markup, id, colour, custom }) {

    const text = striptags(markup);

    if (!id) {
        id = makeId(text);
    }

    return {
        text,
        markup,
        id: `info-token-${id}`,
        colour: `var(--${colour || "grey"})`,
        custom: Boolean(custom)
    };

}

function drawToken(data) {

    drawButton(data);
    drawDialog(data);

}

function drawButton(data) {

    const {
        text,
        id,
        colour,
        custom
    } = interpret(data);

    const holder = (
        custom
        ? customHolder
        : buttonHolder
    );

    holder.append(buttonTemplate.draw([
        [
            ".js--info-token--button",
            null,
            (element) => {

                element.textContent = text;
                element.style.setProperty("--bg-colour", colour);
                element.dataset.dialog = `#${id}`;

            }
        ]
    ]));

}

function drawDialog(data) {

    const {
        markup,
        id,
        colour
    } = interpret(data);

    dialogHolder.append(dialogTemplate.draw([
        [
            ".js--info-token--dialog",
            null,
            (element) => {

                element.id = id;
                element.style.setProperty("--colour", colour);

            }
        ],
        [
            ".js--info-token--dialog-text",
            markup,
            (element) => element.innerHTML = markup
        ]
    ]));

}

function addMarkup(text) {
    return text.replace(/\*\*([^*]*)\*\*/g, "<strong>$1</strong>");
}

lookupOne("#add-info-token").addEventListener("click", () => {

    const text = window.prompt("What do you want your new info token to say? Use **double asterisks** to emphasise text.");

    drawToken({
        markup: addMarkup(text),
        custom: true
    });

});
