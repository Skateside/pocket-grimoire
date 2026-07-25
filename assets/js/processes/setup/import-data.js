import Observer from "../../classes/Observer.js";

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
