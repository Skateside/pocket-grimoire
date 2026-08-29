import CharacterToken from "../classes/CharacterToken.js";
import Observer from "../classes/Observer.js";
import TokenStore from "../classes/TokenStore.js";

const gameObserver = Observer.create("game");

Promise.all([
    new Promise((resolve) => {
        gameObserver.on("characters-loaded", ({ detail }) => {
            resolve(detail.characters);
        });
    }),
    new Promise((resolve) => {
        gameObserver.on("jinxes-loaded", ({ detail }) => {
            resolve(detail.jinxes);
        });
    }),
    new Promise((resolve) => {
        gameObserver.on("scripts-loaded", ({ detail }) => {
            resolve(detail.scripts);
        });
    }),
]).then(([ characters, jinxes, scripts ]) => {

    TokenStore.create({
        characters: [
            // Create an empty character which we can use as a token placeholder.
            {
                id: TokenStore.EMPTY,
                image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
                ability: I18N.emptyCharacterAbility,
                [CharacterToken.empty]: true,
            },
            ...characters
        ],
        reminders: [
            {
                id: TokenStore.EMPTY,
                name: "",
                text: I18N.goodTeam,
                image: "/build/img/roles/generic/good.webp",
                isGlobal: true
            },
            {
                id: TokenStore.EMPTY,
                name: "",
                text: I18N.evilTeam,
                image: "/build/img/roles/generic/evil.webp",
                isGlobal: true
            }
        ],
        jinxes,
        scripts,
    });

});

// Add a delay to all event listeners to be registered before being triggered.
Promise.resolve().then(() => {
    const gameObserver = Observer.create("game");

    if (!window.PG) {
        throw new ReferenceError("Unable to find the PG object");
    }

    const { roles, jinxes, game, scripts } = window.PG;

    gameObserver.trigger("characters-loaded", { characters: roles });
    gameObserver.trigger("jinxes-loaded", { jinxes });
    gameObserver.trigger("team-breakdown-loaded", { breakdown: game });
    gameObserver.trigger("scripts-loaded", { scripts });
});
