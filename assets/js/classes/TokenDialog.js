import Dialog from "./Dialog.js";
import {
    lookupOneCached
} from "../utils/elements.js";

export default class TokenDialog extends Dialog {

    static get() {
        return this.create(lookupOneCached("#token"));
    }

    constructor(dialog) {
        super(dialog);
        this.ids = [];
    }

    addId(id) {
        this.ids.push(id);
    }

    removeId(id) {
        this.ids = this.ids.filter((existingId) => existingId !== id);
    }

    removeIdByIndex(index) {
        this.ids.splice(index, 1);
    }

    setIds(ids) {
        this.ids = ids;
    }

    getIds() {
        return [...this.ids];
    }

    setTitle(title, preserve = 0) {

        if (!this.isTitleLocked) {
            lookupOneCached("#token-name").textContent = title;
        }

        if (preserve > 0) {

            this.isTitleLocked = true;
            window.setTimeout(() => this.isTitleLocked = false, preserve);

        }

    }

}
