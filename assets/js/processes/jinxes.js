import Observer from "../classes/Observer.js";
import TokenStore from "../classes/TokenStore.js";
import {
    lookup
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

// gameObserver.on("characters-selected", ({ detail }) => {
//
//     TokenStore.ready((tokenStore) => {
//
//         tokenStore.getAllCharacters().forEach((character) => {
//             // character.deactivateAllJinxes();
//             // character.unreadyAllJinxes();
//             // character.deactivateJinxes();
//         });
//
//     });
//
// });

TokenStore.ready((tokenStore) => {

    const allCharacters = tokenStore.getAllCharacters();
    const allJinxes = tokenStore.getAllJinxes();

    // Set up all the theoretical jinxes.
    // allCharacters.forEach((character) => {
    //
    //     allJinxes.forEach((jinx) => {
    //
    //         if (jinx.matches(character)) {
    //             character.addJinx(jinx);
    //         }
    //
    //     });
    //
    // });
    // NOTE: I think that TokenStore is handling all of this.

    const trickToTarget = Object.create(null);

    allJinxes.forEach((jinx) => {

        // Give all the jinxes an observer.
        jinx.setObserver(tokenObserver);

        // Create a map so we can easily find targets from the trick.
        const trickId = jinx.getTrick().getId();

        if (!trickToTarget[trickId]) {
            trickToTarget[trickId] = [];
        }

        trickToTarget[trickId].push(jinx.getTarget().getId());

    });

    gameObserver.on("characters-selected", ({ detail }) => {

        allJinxes.forEach((jinx) => jinx.toggleReady(false));

        const {
            characters
        } = detail;

        characters.forEach((character) => character.readyAllJinxes(characters));

    });

    gameObserver.on("character-toggle", ({ detail }) => {

        const {
            id,
            active
        } = detail;

        const character = tokenStore.getCharacter(id);

        character.toggleJinxTarget(active);
console.log({ character, [`trickToTarget[${id}]`]: trickToTarget[id] });

        trickToTarget[id]?.forEach((targetId) => {
console.log({ trick: character, targetId, target: tokenStore.getCharacter(targetId), active });
            tokenStore
                .getCharacter(targetId)
                .toggleJinxTrick(character, active);

        });

    });

});

// TokenStore.ready((tokenStore) => {
//
//     // const allCharacters = tokenStore.getAllCharacters();
//     // const allJinxes = tokenStore.getAllJinxes();
//     //
//     // allCharacters.forEach((character) => {
//     //
//     //     allJinxes.forEach((jinx) => {
//     //
//     //         if (jinx.includes(character)) {
//     //             character.addJinx(jinx);
//     //         }
//     //
//     //     });
//     //
//     // });
//
//     // gameObserver.on("characters-selected", ({ detail }) => {
//     //     detail.characters.forEach((character) => character.readyAllJinxes());
//     // });
//
//     const allCharacters = tokenStore.getAllCharacters();
//     const inverseJinxes = Object.create(null);
//     // const jinxMap = Object.create(null);
//     const selectedCharacters = [];
//
//     gameObserver.on("characters-selected", ({ detail }) => {
//
//         // Deactivate all existing jinxes.
//         allCharacters.forEach((character) => character.unreadyAllJinxes());
//
//         // Clear the references.
//         Object.keys(inverseJinxes).forEach((key) => delete inverseJinxes[key]);
//         // Object.keys(jinxMap).forEach((key) => delete jinxMap[key]);
//         selectedCharacters.length = 0;
//
//         // Ready any jinxes on this script.
//         const {
//             characters
//         } = detail;
//
//         characters.forEach((character) => {
//
//             character.getJinxes().forEach((jinx) => {
//
//                 const trick = characters.find((char) => jinx.matches(char));
//
//                 if (!trick) {
//                     return
//                 }
//
//                 character.toggleJinxReady(trick, true);
//
//                 tokenObserver.trigger("toggle-jinx-ready", {
//                     character,
//                     trick,
//                     isReady: true
//                 });
//
//                 const trickId = trick.getId();
//
//                 if (!inverseJinxes[trickId]) {
//                     inverseJinxes[trickId] = [];
//                 }
//
//                 inverseJinxes[trickId].push(character);
//
//                 const characterId = character.getId();
//
//                 if (!jinxMap[characterId]) {
//                     jinxMap[characterId] = [];
//                 }
//
//                 jinxMap[characterId].push(trick);
//
//             });
//
//         });
//
//     });
//
//     gameObserver.on("character-toggle", ({ detail }) => {
//
//         const {
//             id,
//             active
//         } = detail;
//
//         if (active) {
//             selectedCharacters.push(id);
//         } else {
//
//             const index = selectedCharacters.indexOf(id);
//
//             if (index > -1) {
//                 selectedCharacters.splice(index, 1);
//             }
//
//         }
//
//         const selectedCharacter = tokenStore.getCharacter(id);
// console.log({
//     inverseJinxes,
//     jinxMap,
//     "selectedCharacter.getId()": selectedCharacter.getId(),
//     "inverseJinxes[selectedCharacter.getId()]": inverseJinxes[selectedCharacter.getId()],
//     "jinxMap[selectedCharacter.getId()]": jinxMap[selectedCharacter.getId()]
// });
//
//         // const checks = (
//         //     inverseJinxes[selectedCharacter.getId()]
//         //     || jinxMap[selectedCharacter.getId()]
//         // );
//         // const checks = [];
//         //
//         // inverseJinxes[selectedCharacter.getId()]?.forEach((check) => {
//         //     checks.push(check);
//         // });
//         //
//         // jinxMap[selectedCharacter.getId()]?.forEach((mapped) => {
//         //
//         //     const inverted = inverseJinxes[mapped.getId()];
//         //
//         //     if (inverted && inverted.length) {
//         //         checks.push(...inverted);
//         //     }
//         //
//         // });
//
//         inverseJinxes[selectedCharacter.getId()]?.forEach((character) => {
//         // checks?.forEach((character) => {
// console.log({ character });
//             if (!character) {
//                 return;
//             }
//
//             const isActive = (
//                 active && selectedCharacters.includes(character.getId())
//             );
//
//             character.toggleJinxActive(selectedCharacter, isActive);
//
//             tokenObserver.trigger("toggle-jinx-active", {
//                 character,
//                 isActive,
//                 trick: selectedCharacter
//             });
//
//         });
//
//     });
//
// });

// TODO: expose the jinxes in a method.
/*
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
*/
