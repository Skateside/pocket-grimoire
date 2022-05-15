import Observer from "../classes/Observer.js";
import TokenStore from "../classes/TokenStore.js";
import Template from "../classes/Template.js";
import {
    lookupOne,
    replaceContentsMany
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

TokenStore.ready((tokenStore) => {

    const allCharacters = tokenStore.getAllCharacters();
    const allJinxes = tokenStore.getAllJinxes();
    const trickToTarget = Object.create(null);
    const jinxTemplate = Template.create(lookupOne("#jinx-table-template"));

    allJinxes.forEach((jinx) => {

        // Set up all the jinxes.
        jinx.setObserver(tokenObserver);
        jinx.setTemplate(jinxTemplate);

        // Create a map so we can easily find targets from the trick.
        const trickId = jinx.getTrick().getId();

        if (!trickToTarget[trickId]) {
            trickToTarget[trickId] = [];
        }

        trickToTarget[trickId].push(jinx.getTarget().getId());

    });

    // Unready any old jinxes and ready any jinxes on the current script.
    gameObserver.on("characters-selected", ({ detail }) => {

        allJinxes.forEach((jinx) => jinx.toggleReady(false));

        const {
            characters
        } = detail;

        characters.forEach((character) => character.readyAllJinxes(characters));

        gameObserver.trigger("jinxes-ready", {
            jinxes: allJinxes.filter((jinx) => jinx.isReady())
        });

    });

    // Toggle jinx states based on characters being selected or unselected.
    gameObserver.on("character-toggle", ({ detail }) => {

        const {
            id,
            active
        } = detail;

        const character = tokenStore.getCharacter(id);

        character.toggleJinxTarget(active);

        trickToTarget[id]?.forEach((targetId) => {

            tokenStore
                .getCharacter(targetId)
                .toggleJinxTrick(character, active);

        });

    });

    // Draw all ready jinxes.
    const jinxSection = lookupOne("#jinxes");
    const jinxTable = lookupOne("#jinx-table");

    gameObserver.on("jinxes-ready", ({ detail }) => {

        const {
            jinxes
        } = detail;

        jinxSection.hidden = jinxes.length === 0;

        replaceContentsMany(
            jinxTable,
            jinxes.map((jinx) => jinx.draw())
        );

    });

    tokenObserver.on("toggle-jinx-active", ({ detail }) => {

        const {
            jinx,
            active
        } = detail;

        lookupOne(`#${jinx.getId()}`)?.classList.toggle("is-active", active);

    });

    // Activate and deactivate the jinxes as characters are added to the
    // grimoire pad.
    const characters = [];

    tokenObserver.on("character-add", ({ detail }) => {

        const {
            character
        } = detail;
        const jinxes = Object.create(null);

        character.getJinxes().forEach((jinx) => {

            jinx.toggleTarget(true);
            jinxes[jinx.getTrick().getId()] = jinx;

        });
        characters.forEach((char) => {

            char.toggleJinxTrick(character, true);
            jinxes[char.getId()]?.toggleTrick(true);

        });
        characters.push(character);

    });

    tokenObserver.on("character-remove", ({ detail }) => {

        const {
            character
        } = detail;
        const id = character.getId();

        characters.splice(characters.indexOf(character), 1);

        if (!characters.find((char) => char.getId() === id)) {

            character.getJinxes().forEach((jinx) => jinx.toggleTarget(false));
            characters.forEach((char) => char.toggleJinxTrick(character, false));

        }

    });

    // Allow all Jinxes to be shown based on user preference.
    lookupOne("#show-all-jinxes").addEventListener("change", ({ target }) => {
        jinxTable.classList.toggle("is-show-all", target.checked);
    });

});
