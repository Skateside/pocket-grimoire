import Observer from "../classes/Observer.js";
import {
    lookupOne,
    lookupCached,
    lookupOneCached,
    replaceContentsMany
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

gameObserver.on("characters-selected", ({ detail }) => {

    const {
        characters
    } = detail;

    replaceContentsMany(
        lookupOneCached("#first-night"),
        characters
            .filter((character) => character.getFirstNight())
            .sort((a, b) => a.getFirstNight() - b.getFirstNight())
            .map((character) => character.drawNightOrder(true))
    );

    replaceContentsMany(
        lookupOneCached("#other-nights"),
        characters
            .filter((character) => character.getOtherNight())
            .sort((a, b) => a.getOtherNight() - b.getOtherNight())
            .map((character) => character.drawNightOrder(false))
    );

});

tokenObserver.on("character-add", ({ detail }) => {

    const id = detail.character.getId();

    const firstNight = lookupOne(`#first-night [data-id="${id}"]`);
    const otherNights = lookupOne(`#other-nights [data-id="${id}"]`);

    if (firstNight) {

        firstNight.dataset.count = (Number(firstNight.dataset.count) || 0) + 1;
        firstNight.classList.add("is-playing");

    }

    if (otherNights) {

        otherNights.dataset.count = (Number(otherNights.dataset.count) || 0) + 1;
        otherNights.classList.add("is-playing");

    }

});

tokenObserver.on("character-remove", ({ detail }) => {

    const id = detail.character.getId();

    const firstNight = lookupOne(`#first-night [data-id="${id}"]`);
    const otherNights = lookupOne(`#other-nights [data-id="${id}"]`);

    if (firstNight) {

        const count = (Number(firstNight.dataset.count) || 1) - 1;
        firstNight.dataset.count = count;

        if (count === 0) {
            firstNight.classList.remove("is-playing");
        }

    }

    if (otherNights) {

        const count = (Number(otherNights.dataset.count) || 1) - 1;
        otherNights.dataset.count = count;

        if (count === 0) {
            otherNights.classList.remove("is-playing");
        }

    }

});

lookupOne("#show-all").addEventListener("change", ({ target }) => {

    const showAll = target.checked;

    lookupCached(".night-order").forEach((list) => {
        list.classList.toggle("is-show-all", showAll);
    });

    gameObserver.trigger("night-order-show-all", {
        showAll
    });

});
