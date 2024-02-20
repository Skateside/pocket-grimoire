import Dialog from "./Dialog.js";
import ProcessList from "./ProcessList.js";
import {
    lookupOneCached
} from "../utils/elements.js";

/**
 * A version of {@link Dialog} that handles the "Select character" dialog.
 */
export default class SelectDialog extends Dialog {

    /**
     * @inheritdoc
     */
    constructor(dialog) {

        super(dialog);

        /**
         * A list of all the processes that this dialog might handle.
         * @type {ProcessList}
         */
        this.processList = new ProcessList();

    }

    /**
     * Adds a process to {@link SelectDialog#processList} - see
     * {@link ProcessList#addUnique}.
     *
     * @param {Object} process
     *        Process to add.
     */
    addProcess(process) {
        this.processList.addUnique(process);
    }

    /**
     * Remove a process from {@link SelectDialog#processList} - see
     * {@link ProcessList#remove}.
     *
     * @param {Object} process
     *        Process to remove.
     */
    removeProcess(process) {
        this.processList.remove(process);
    }

    /**
     * @inheritdoc
     */
    addListeners() {

        super.addListeners();

        this.dialog.addEventListener("click", ({ target }) => {

            const button = target.closest("[data-token-id]");

            if (!button) {
                return;
            }

            ProcessList.execute(
                this.processList.last(),
                "click",
                button.dataset.tokenId
            );

        });

        this.on(this.constructor.HIDE, () => {
            ProcessList.execute(this.processList.last(), "hide");
        });

    }

    /**
     * Gets a cached instance of {@link SelectDialog}, allowing it to act like a
     * singleton.
     *
     * @return {SelectDialog}
     *         An instance.
     */
    static get() {
        return this.create(lookupOneCached("#character-list"));
    }

}
