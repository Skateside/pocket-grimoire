import {
    groupBy
} from "../utils/arrays.js";

export default class Bluffs {

    constructor(bluffs, observer) {

        this.bluffs = bluffs;

        bluffs.forEach((bluff) => bluff.setObserver(observer));

    }

    setNoCharacter(noCharacter) {
        this.noCharacter = noCharacter;
    }

    reset(triggerEvent = true) {

        this.bluffs.forEach((bluff) => {
            bluff.display(this.noCharacter, triggerEvent);
        });

    }

    display(selector, character) {

        const {
            bluffs
        } = this;
        const bluff = bluffs.find((bluff) => bluff.getSelector() === selector);

        if (!bluff) {
            throw new ReferenceError(`No bluff found with selector ${selector}`);
        }

        bluff.display(character);

    }

}
