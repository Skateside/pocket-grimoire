import Observer from "../classes/Observer.js";
import {
    lookupOne,
    lookupOneCached
} from "./utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");


function drawNightOrder({
    id,
    name,
    image,
    text
}) {

    const clone = lookupOneCached("#night-info-template").content.cloneNode(true);

    lookupOne(".js--night-info--wrapper", clone).dataset.id = id;
    lookupOne(".js--night-info--icon", clone).src = image;
    lookupOne(".js--night-info--role", clone).textContent = name;
    lookupOne(".js--night-info--ability", clone).textContent = text;

    return clone;

}

gameObserver.on("characters-selected", ({ detail: characters }) => {

    const nights = [[], []];

    characters.forEach(({
        id,
        name,
        image,
        firstNight,
        firstNightReminder,
        otherNight,
        otherNightReminder
    }) => {

        const data = {
            id,
            name,
            image,
        };

        if (firstNight) {

            data.text = firstNightReminder;
            nights[0][firstNight] = data;

        }

        if (otherNight) {

            data.text = otherNightReminder;
            nights[1][otherNight] = data;

        }

    });

    const firstNight = lookupOneCached("#first-night")
    firstNight.innerHTML = "";
    nights[0].forEach((data) => {
        firstNight.append(drawNightOrder(data));
    });

    const otherNights = lookupOneCached("#other-nights")
    otherNights.innerHTML = "";
    nights[1].forEach((data) => {
        otherNights.append(drawNightOrder(data));
    });

});

tokenObserver.on("character-added", ({ detail }) => {

    const {
        id
    } = detail.data;
    const firstNight = lookupOne(`#first-night [data-id="${id}"]`);
    const otherNights = lookupOne(`#other-nights [data-id="${id}"]`);

    if (firstNight) {
        firstNight.classList.add("is-playing");
    }

    if (otherNights) {
        otherNights.classList.add("is-playing");
    }

});

tokenObserver.on("character-removed", ({ detail }) => {

    const {
        id
    } = detail.data;
    const firstNight = lookupOne(`#first-night [data-id="${id}"]`);
    const otherNights = lookupOne(`#other-nights [data-id="${id}"]`);

    if (firstNight) {
        firstNight.classList.remove("is-playing");
    }

    if (otherNights) {
        otherNights.classList.remove("is-playing");
    }

});
