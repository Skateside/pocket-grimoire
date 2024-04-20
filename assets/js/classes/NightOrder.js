export default class NightOrder {

    constructor() {

        this.showNotInPlay = false;
        this.showDead = false;
        this.data = [];

        this.reset();

    }

    reset() {

        this.data.length = 0;
        this.redraw();

    }

    redraw() {
        return;
    }

    setShowNotInPlay(showNotInPlay) {

        this.showNotInPlay = showNotInPlay;
        this.redraw();

    }

    setShowDead(showDead) {

        this.showDead = showDead;
        this.redraw();

    }

    setCharacters(characters) {

        characters.forEach((character) => {

            const data = {
                character,
                inPlay: 0,
                alive: 0
            };
            const firstNight = character.getFirstNight();
            const otherNight = character.getOtherNight();

            if (firstNight) {

                data.first = {
                    order: firstNight,
                    element: character.drawNightOrder(true).firstElementChild
                };

            }

            if (otherNight) {

                data.other = {
                    order: otherNight,
                    element: character.drawNightOrder(false).firstElementChild
                };

            }

            this.data.push(data);

        });

        this.redraw();

    }

    drawNightOrder(isFirstNight) {

        const {
            data
        } = this;
        const property = (
            isFirstNight
            ? "first"
            : "other"
        );

        return data
            .filter((data) => data[property])
            .filter((data) => this.shouldShow(data))
            .sort((a, b) => a[property].order - b[property].order)
            .reduce((fragment, data) => {

                const {
                    element
                } = data[property];

                element.classList.toggle("is-in-play", this.isInPlay(data));
                element.classList.toggle("is-dead", this.isDead(data));

                fragment.append(element);

                return fragment;

            }, document.createDocumentFragment());


    }

    isInPlay(data) {
        return data.inPlay > 0;
    }

    isDead(data) {
        return data.inPlay > 0 && data.alive === 0;
    }

    shouldShow(data) {

        const {
            showNotInPlay,
            showDead
        } = this;
        const isInPlay = this.isInPlay(data);
        const isDead = this.isDead(data);

        return (
            (isInPlay && !isDead)
            || (!isInPlay && showNotInPlay)
            || (isDead && showDead)
        );

    }

    getDataIndex(character) {

        const id = character.getId();
        const index = this.data.findIndex((data) => {
            return data.character.getId() === id;
        });

        if (index < 0) {

            throw new ReferenceError(
                `Cannot find character "${character.getId()}"`
            );

        }

        return index;

    }

    getData(character) {
        return this.data[this.getDataIndex(character)];
    }

    addCharacter(character) {

        const data = this.getData(character);

        data.inPlay += 1;
        data.alive = Math.min(data.alive + 1, data.inPlay);

        this.redraw();

    }

    removeCharacter(character) {

        const index = this.getDataIndex(character);
        const {
            data
        } = this;

        data.inPlay -= 1;

        if (data.inPlay <= 0) {

            data.splice(index, 1);
            this.redraw();

        }

    }

    toggleDead(character, isDead) {

        const data = this.getData(character);

        if (isDead) {
            data.alive = Math.max(data.alive - 1, 0);
        } else {
            data.alive = Math.min(data.alive + 1, data.inPlay);
        }

        this.redraw();

    }

}