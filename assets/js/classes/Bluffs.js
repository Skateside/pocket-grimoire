import {
    groupBy
} from "../utils/arrays.js";
import {
    identify
} from "../utils/elements.js";

export default class Bluffs {

    static get() {
        return this.instance;
    }

    static create(...args) {

        let bluffs = this.instance;

        if (!bluffs) {

            bluffs = new this(...args);
            this.instance = bluffs;

        }

        return bluffs;

    }

    constructor(bluffs, observer) {

        this.bluffs = bluffs;

        bluffs.forEach((bluff) => bluff.setObserver(observer));

    }

    setNoCharacter(noCharacter) {

        this.noCharacter = noCharacter;

        this.bluffs.forEach((bluff) => {

            if (!bluff.hasCharacter()) {
                bluff.setCharacter(noCharacter);
            }

        });

    }

    reset(triggerEvent = true) {

        this.bluffs.forEach((bluff) => {
            bluff.display(this.noCharacter, triggerEvent);
        });

    }

    display(selector, character) {

        const bluff = this.getBluff(selector);

        if (!bluff) {
            throw new ReferenceError(`No bluff found with selector ${selector}`);
        }

        bluff.display(character);

    }

    getBluff(selector) {
        return this.bluffs.find((bluff) => bluff.getSelector() === selector);
    }

    getCharacter(selector) {
        return this.getBluff(selector)?.getCharacter();
    }

    getCharacterByButton(button) {
        return this.getCharacter(`#${identify(button)}`);
    }

}
