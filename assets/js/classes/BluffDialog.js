import Dialog from "./Dialog.js";
import {
    empty,
    lookupOneCached
} from "../utils/elements.js";

export default class BluffDialog extends Dialog {

    display(character) {

        const {
            dialog
        } = this;

        lookupOneCached(
            "#bluff-show-name",
            dialog
        ).textContent = character.getName();
        lookupOneCached(
            "#bluff-show-ability",
            dialog
        ).textContent = character.getAbility();
        empty(lookupOneCached("#bluff-show-token", dialog)).append(
            character.drawToken()
        );

    }

}
