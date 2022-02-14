import Observer from "../classes/Observer.js";
import TokenStore from "../classes/TokenStore.js";
import {
    lookup
} from "../utils/elements.js";

const gameObserver = Observer.create("game");

gameObserver.on("characters-selected", ({ detail }) => {

    TokenStore.ready(({ characters }) => {

        Object.values(characters).forEach((character) => {
            character.deactivateAllJinxes();
        });

    });

});

TokenStore.ready(({ characters, jinxes }) => {

    let inputs = [];

    const allCharacters = Object.values(characters);
    const charactersMap = Object.fromEntries(
        allCharacters.map((character) => [character.getId(), character])
    );

    gameObserver.on("characters-selected", () => {
        inputs = lookup(".js--character-select--input")
    });

    gameObserver.on("character-toggle", ({ detail }) => {

        inputs.filter((input) => input.checked).forEach((input) => {

            const character = characters[input.value];
            const jinxList = jinxes[character.getId()]?.map(({ id }) => id);

            if (!jinxList || !jinxList.length) {
                return;
            }

// Currently this seems to be turning off too many jinxes, or maybe turning on
// too many at the start :-/
            jinxList.forEach((id) => {
console.log({ id, "charactersMap[id]": charactersMap[id], "detail.active": detail.active });
                if (charactersMap[id]) {
                    character.toggleJinxById(id, detail.active);
                }

            });

            input
                .closest(".js--character-select--label")
                .querySelector(".js--character-select--name")
                .classList.toggle(
                    "is-jinx",
                    character.getActiveJinxes().length > 0
                );

        });

    });

});
