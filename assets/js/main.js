import Dialog from "./classes/Dialog.js";
import { getCached } from "./utils/getCached.js";

// const editionDialog = Dialog.createFromTrigger(
//     document.getElementById("select-edition")
// );

document.querySelectorAll("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});

// getCached("/assets/data/characters.json");

const lookupCache = new WeakMap();

function lookup(selector, context = document) {

    let cache = lookupCache.get(context);

    if (!cache) {

        cache = Object.create(null);
        lookupCache.set(context, cache);

    }

    if (!cache[selector]) {
        cache[selector] = [...context.querySelectorAll(selector)];
    }

    return cache[selector];

}

class CharacterData {

    constructor(url) {
        this.lookup = getCached(url);
    }

    getEdition(edition) {

        return this.lookup.then((characters) => (
            characters.filter((character) => character.edition === edition)
        ));

    }

    getIds(ids) {

        const idList = ids.map(({ id }) => id);

        return this.lookup.then((characters) => (
            characters.filter((character) => idList.includes(character.id))
        ));

    }

    then(handler) {
        return this.lookup.then(handler);
    }

}

const selectChacters = document.getElementById("select-characters");
const characterData = new CharacterData("/assets/data/characters.json");

characterData.then(() => selectChacters.disabled = false);

// populate the character popup here.
// <fieldset class="character-select__group" data-team="townsfolk">
//     <legend class="character-select__title">Townsfolk</legend>
//     <div class="character-select__score">
//         <div class="character-select__score-box">
//             <span class="js--character-select--count"></span> / <span class="js--character-select--total"></span>
//         </div>
//     </div>
//     <div class="character-select__characters js--character-select--list"></div>
// </fieldset>

// <dialog class="dialog dialog--blur-background" id="edition-list" data-dialog-hide-on-click-backdrop>
//     <div class="dialog__content">
//         <button class="dialog__hide" type="button" data-dialog-hide>&times;</button>
//         <ul>
//             <li><button type="button" data-edition="tb">Trouble Brewing</button></li>
//             <li><button type="button" data-edition="bmr">Bad Moon Rising</button></li>
//             <li><button type="button" data-edition="snv">Sects and Violets</button></li>
//         </ul>
//     </div>
// </dialog>

let identifyCounter = 0;

export function identify(element, prefix = "anonymous-element-") {

    let {
        id
    } = element;

    if (!id) {

        do {

            id = `${prefix}${identifyCounter}`;
            identifyCounter += 1;

        } while (document.getElementById(id));

        element.id = id;

    }

    return id;

}


const editionList = document.getElementById("edition-list");
const editionListDialog = Dialog.create(editionList);
editionList.addEventListener("click", ({ target }) => {

    const button = target.closest("[data-edition]");

    if (!button) {
        return;
    }

    const {
        edition
    } = button.dataset;

    characterData.getEdition(edition).then((characters) => {

        lookup("[data-team]").forEach((wrapper) => {

            const team = wrapper.dataset.team;
            const list = lookup(".js--character-select--list", wrapper)[0];

            list.innerHTML = "";
            const frag = document.createDocumentFragment();

            characters.forEach((character) => {

                if (character.team !== team) {
                    return;
                }

                const input = document.createElement("input");
                input.type = "checkbox";
                input.name = "character";
                const label = document.createElement("label");
                label.htmlFor = identify(input)
                label.textContent = character.name;

                frag.append(input);
                frag.append(label);

            });

            list.append(frag);

        });

        editionListDialog.hide();

    });

});

const playerCount = document.getElementById("player-count");
const playerCountOutput = document.getElementById("player-count-output");

playerCount.addEventListener("input", () => playerCountOutput.value = playerCount.value);

class GameData {

    constructor(url) {
        this.lookup = getCached(url);
    }

    then(handler) {
        return this.lookup.then(handler);
    }

    getTable() {
        return this.lookup;
    }

    getRow(players) {

        return this.lookup.then((data) => {
            return data[Math.min(players - 5, data.length - 1)];
        });

    }

}


const gameData = new GameData("/assets/data/game.json");

function setTotals() {

    gameData.getRow(playerCount.value).then((data) => {

        Object.entries(data).forEach(([team, count]) => {

            lookup(`[data-team="${team}"] .js--character-select--total`).forEach((element) => {
                element.textContent = count;
            });

        });

    })

}

playerCount.addEventListener("input", setTotals);
gameData.then(setTotals);
