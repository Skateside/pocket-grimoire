import Observer from "../classes/Observer.js";
import TokenStore from "../classes/TokenStore.js";
import Template from "../classes/Template.js";
import Jinx from "../classes/Jinx.js";
import {
    lookupOne,
    replaceContentsMany
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

TokenStore.ready((tokenStore) => {

    const trickToTarget = Object.create(null);
    const jinxTemplate = Template.create(lookupOne("#jinx-table-template"));

    /**
     * Registers a jinx in the {@link trickToTarget} map.
     *
     * @param {Jinx} jinx
     *        Jinx to register.
     */
    function registerJinx(jinx) {

        const trickId = jinx.getTrick()?.getId();

        if (!trickId) {
            return;
        }

        if (!trickToTarget[trickId]) {
            trickToTarget[trickId] = [];
        }

        trickToTarget[trickId].push(jinx.getTarget().getId());

    }

    /**
     * Removes a jinx from the {@link trickToTarget} map, keeping it tidy and
     * preventing old data from creating false positives.
     *
     * @param {Jinx} jinx
     *        Jinx to unregister.
     */
    function unregisterJinx(jinx) {

        const trickId = jinx.getTrick().getId();

        if (!trickToTarget[trickId]) {
            return;
        }

        const index = trickToTarget[trickId].indexOf(jinx.getTarget().getId());

        if (index < 0) {
            return;
        }

        trickToTarget[trickId].splice(index, 1);

        if (!trickToTarget[trickId].length) {
            delete trickToTarget[trickId];
        }

    }

    /**
     * Activates the given Jinx, setting the observer and template, and
     * registering it.
     *
     * @param {Jinx} jinx
     *        Jinx to activate.
     */
    function activateJinx(jinx) {

        jinx.setObserver(tokenObserver);
        jinx.setTemplate(jinxTemplate);
        registerJinx(jinx);

    }

    tokenStore.getAllJinxes().forEach(activateJinx);

    // Unready any old jinxes and ready any jinxes on the current script.
    gameObserver.on("characters-selected", ({ detail }) => {

        tokenStore.getAllJinxes().forEach((jinx) => jinx.toggleReady(false));
        tokenStore.getAllHomebrewJinxes().forEach(unregisterJinx);
        tokenStore.removeAllHomebrewJinxes();

        const {
            characters
        } = detail;

        characters.forEach((character) => {

            // A character will only have "jinxes" data if it's a homebrew role
            // that includes jinxes. When that happens - create Jinx instances
            // for them, add them to the character, and register them in the
            // store so that they can interact with the system.
            if (character.hasData("jinxes")) {

                character.getData("jinxes").forEach(({ id, reason }) => {

                    const trick = tokenStore.getCharacter(id);
                    const jinx = new Jinx(trick, reason);
                    jinx.setIsHomebrew(true);
                    character.addJinx(jinx);
                    activateJinx(jinx);
                    tokenStore.addJinx(jinx);

                });

            }

            character.readyAllJinxes(characters);

        });

        const allJinxes = tokenStore.getAllJinxes();

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
