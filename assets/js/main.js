import Dialog from "./classes/Dialog.js";
import {
    getCached
} from "./utils/getCached.js";
import {
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached,
    identify
} from "./utils/elements.js";

lookupCached("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});

class CharacterData {

    constructor(url) {
        this.lookup = getCached(url);
    }

    then(handler) {
        return this.lookup.then(handler);
    }

    getEdition(edition) {

        return this.then((characters) => (
            characters.filter((character) => character.edition === edition)
        ));

    }

    getIds(ids) {

        const idList = ids.map(({ id }) => id);

        return this.then((characters) => (
            characters.filter((character) => idList.includes(character.id))
        ));

    }

}

const selectChacters = lookupOne("#select-characters");
const characterData = new CharacterData("/assets/data/characters.json");

characterData.then(() => selectChacters.disabled = false);


const editionList = lookupOne("#edition-list");
const editionListDialog = Dialog.create(editionList);
const characterSelectTemplate = lookupOne("#character-select-template");

editionList.addEventListener("click", ({ target }) => {

    const button = target.closest("[data-edition]");

    if (!button) {
        return;
    }

    const {
        edition
    } = button.dataset;

    characterData.getEdition(edition).then((characters) => {

        lookupCached("[data-team]").forEach((wrapper) => {

            const wrapperTeam = wrapper.dataset.team;
            const list = lookupOneCached(".js--character-select--list", wrapper);

            list.innerHTML = "";
            const frag = document.createDocumentFragment();

            characters.forEach(({
                id,
                team,
                image,
                name
            }) => {

                if (team !== wrapperTeam) {
                    return;
                }

                const clone = characterSelectTemplate.content.cloneNode(true);
                const label = clone.querySelector(".js--character-select--label");
                const input = clone.querySelector(".js--character-select--input");
                const img = clone.querySelector(".js--character-select--image");
                const text = clone.querySelector(".js--character-select--name");

                label.htmlFor = identify(input);
                input.value = id;
                img.src = image;
                text.textContent = name;

                frag.append(clone);

            });

            list.append(frag);

        });

        editionListDialog.hide();

    });

});

lookupCached("[data-team]").forEach((wrapper) => {

    const countElement = lookupOneCached(".js--character-select--count", wrapper);

    wrapper.addEventListener("change", () => {

        countElement.textContent = lookup(
            "input[type=\"checkbox\"]:checked",
            wrapper
        ).length;

    });

});

const playerCount = lookupOne("#player-count");
const playerCountOutput = lookupOne("#player-count-output");

playerCount.addEventListener("input", () => playerCountOutput.value = playerCount.value);

class GameData {

    constructor(url) {
        this.lookup = getCached(url);
    }

    then(handler) {
        return this.lookup.then(handler);
    }

    getRow(players) {

        return this.then((data) => {
            return data[Math.min(players - 5, data.length - 1)];
        });

    }

}


const gameData = new GameData("/assets/data/game.json");

function setTotals() {

    gameData.getRow(playerCount.value).then((data) => {

        Object.entries(data).forEach(([team, count]) => {

            lookupCached(`[data-team="${team}"] .js--character-select--total`).forEach((element) => {
                element.textContent = count;
            });

        });

    })

}

playerCount.addEventListener("input", setTotals);
gameData.then(setTotals);
