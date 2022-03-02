import Observer from "../../classes/Observer.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import {
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached,
    replaceContentsMany,
    announceInput
} from "../../utils/elements.js";
import {
    shuffle,
    groupBy
} from "../../utils/arrays.js";
import {
    clamp
} from "../../utils/numbers.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

/**
 * Sets the totals for each team based on the breakdown that#s given.
 *
 * @param {Object} breakdown
 *        Breakdown of the numbers for the teams.
 */
function setTotals(breakdown) {

    Object.entries(breakdown).forEach(([team, count]) => {

        lookupCached(`[data-team="${team}"] .js--character-select--total`)
            .forEach((element) => {
                element.textContent = count;
            });

    });

}

/**
 * Highlights randomly selected entries in each of the teams.
 *
 * @param {String} team
 *        Name of the team that should have entries randomly highlighted.
 * @param {Number} count
 *        The number of randomly selected items that should be highlighted.
 */
function highlightRandomInTeam(team, count) {

    if (!count) {
        return;
    }

    // Don't cache this since they will change if a different edition is chosen.
    const inputs = lookup(`[data-team="${team}"] [name="character"]`);

    if (!inputs.length) {
        return;
    }

    const chosen = shuffle(inputs).slice(0, count);

    inputs.forEach((input) => {

        const isChecked = input.checked;
        input.checked = chosen.includes(input);

        if (input.checked !== isChecked) {
            announceInput(input);
        }

    });

}

gameObserver.on("team-breakdown-loaded", ({ detail }) => {

    const playerCount = lookupOneCached("#player-count");
    const playerCountOutput = lookupOne("#player-count-output");

    playerCount.addEventListener("input", () => {

        const count = Number(playerCount.value);

        playerCountOutput.value = count;
        gameObserver.trigger("player-count", {
            count
        });

    });

    function getBreakdown() {

        const {
            breakdown
        } = detail;

        return breakdown[clamp(0, playerCount.value - 5, breakdown.length - 1)];

    }

    playerCount.addEventListener("input", () => setTotals(getBreakdown()));
    setTotals(getBreakdown());

    lookupOne("#player-select-random").addEventListener("click", () => {

        let total = 0;

        Object.entries(getBreakdown()).forEach(([team, count]) => {

            highlightRandomInTeam(team, count);
            total += count;

        });

        highlightRandomInTeam("traveller", playerCount.value - total);

    });

});

gameObserver.on("characters-selected", ({ detail }) => {

    const {
        characters
    } = detail;
    const teams = groupBy(characters, (character) => character.getTeam());

    // Populate the team sections.
    lookupCached("[data-team]").forEach((wrapper) => {

        const team = wrapper.dataset.team;
        const isTeamPopulated = Array.isArray(teams[team]);
        wrapper.hidden = !isTeamPopulated;

        replaceContentsMany(
            lookupOneCached(".js--character-select--list", wrapper),
            (teams[team] || []).map((character) => character.drawSelect())
        );

    });

    // Deselect any checkboxes and set the counts to zero.
    lookupCached("[data-team]").forEach((wrapper) => {

        lookup(".js--character-select--input", wrapper).forEach((input) => {
            input.checked = false;
        });

        lookupOneCached(".js--character-select--count", wrapper).textContent = 0;

    });

    // Make sure the Number of players can't exceed the number of characters.
    let maxPlayers = 15;
    maxPlayers += Math.min((teams.traveller || []).length, 5);
    maxPlayers = Math.min(maxPlayers, characters.length);
    const playerCount = lookupOneCached("#player-count");

    playerCount.max = maxPlayers;

    if (playerCount.value >= maxPlayers) {

        playerCount.value = maxPlayers;
        announceInput(playerCount);

    }

    // Enable the "Select Characters" button.
    lookupOneCached("#select-characters").disabled = false;

});

lookupOne("#toggle-abilities").addEventListener("input", ({ target }) => {

    lookupCached("[data-team]").forEach((wrapper) => {
        wrapper.classList.toggle("is-hide-abilities", !target.checked);
    });

});

lookupOne("#toggle-duplicates").addEventListener("input", ({ target }) => {

    lookupCached("[data-team]").forEach((wrapper) => {
        wrapper.classList.toggle("is-hide-duplicates", !target.checked);
    });

});

lookupCached("[data-team]").forEach((wrapper) => {

    wrapper.addEventListener("change", ({ target }) => {

        if (!target.matches("input[name=\"character\"]")) {
            return;
        }

        gameObserver.trigger("character-toggle", {
            element: target,
            id: target.value,
            active: target.checked
        });

    });

    wrapper.addEventListener("input", ({ target }) => {

        if (!target.matches("input[name=\"count\"]")) {
            return;
        }

        gameObserver.trigger("character-count-change", {
            element: target,
            id: target.dataset.for,
            count: Number(target.value)
        });

    });

});

gameObserver.on("character-toggle", ({ detail }) => {

    const {
        element,
        active,
        id
    } = detail;

    const countElement = lookupOneCached(
        ".js--character-select--count",
        element.closest("[data-team]")
    );
    const countInput = lookupOneCached(`[data-for="${id}"]`);
    const quantity = Number(countInput.value) || 1;
    let count = Number(countElement.textContent) || 0;

    if (active) {

        countInput.value = quantity;
        count += quantity;
        // count += 1;

    } else if (count > 0) {

        countInput.value = 0;
        count -= quantity;
        // count -= 1;

    }

    countElement.textContent = count;

});

gameObserver.on("character-count-change", ({ detail }) => {

    const {
        element,
        active,
        id
    } = detail;

    const countElement = lookupOneCached(
        ".js--character-select--count",
        element.closest("[data-team]")
    );
    // const countInput = lookupOneCached(`[data-for="${id}"]`);
    const countInput = element;
    const quantity = Number(countInput.value) || 1;
    let count = Number(countElement.textContent) || 0;
console.log({ element, quantity, count });
    if (active) {

        countInput.value = quantity;
        count += quantity;
        // count += 1;

    } else if (count > 0) {

        countInput.value = 0;
        count -= quantity;
        // count -= 1;

    }

    countElement.textContent = count;

});

// The "character-toggle" script can give misleading numbers when all the inputs
// are re-populated. This call corrects the number when the inputs have finished
// re-populating.
gameObserver.on("inputs-repopulated", () => {

    lookupCached("[data-team]").forEach((wrapper) => {

        lookupOneCached(".js--character-select--count", wrapper).textContent = (
            lookup(":checked", wrapper).length
        );

    });

});

lookupOne("#player-select").addEventListener("submit", (e) => {

    e.preventDefault();

    const ids = lookup(":checked", e.target).map(({ value }) => value);

    TokenStore.ready((tokenStore) => {

        const filtered = tokenStore
            .getAllCharacters()
            .filter((character) => ids.includes(character.getId()));

        gameObserver.trigger("character-draw", {
            characters: filtered
        });

        Dialog.create(lookupOneCached("#character-select")).hide();

    });

});

tokenObserver.on("toggle-jinx-active", ({ detail }) => {

    const {
        jinx,
        state
    } = detail;
    const input = lookupOne(
        `.js--character-select--input[value="${jinx.getTarget()?.getId()}"]`
    );

    if (input) {

        input
            .closest(".js--character-select--label")
            ?.querySelector(".js--character-select--name")
            ?.classList.toggle("is-jinx", state);

    }

});
