import Dialog from "./Dialog.js";
import {
    getIndex,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../utils/elements.js";

export default class TokenDialog extends Dialog {

    static get() {
        return this.create(lookupOneCached("#token"));
    }

    constructor(dialog) {

        super(dialog);
        this.ids = [];
        this.tokenStore = null;
        this.entryTemplate = null;

        this.discoverElements();

    }

    addListeners() {

        super.addListeners();

        const {
            constructor: {
                SHOW,
                HIDE
            },
            dialog
        } = this;

        this.on(SHOW, () => this.drawCharacters());
        this.on(HIDE, () => this.setMultipleTitle(""));

        dialog.addEventListener("click", ({ target }) => {

            const button = target.closest(".js--token--remove");
            const item = button?.closest(".js--token--item");

            if (!button || !item) {
                return;
            }

            this.removeIdByIndex(getIndex(item));
            this.drawCharacters();

        });

    }

    discoverElements() {

        const {
            dialog
        } = this;

        this.title = lookupOne(".js--token--title", dialog);
        this.holder = lookupOne(".js--token--holder", dialog);

    }

    addId(id) {
        this.ids.push(id);
    }

    removeId(id) {
        this.ids = this.ids.filter((existingId) => existingId !== id);
    }

    removeIdByIndex(index) {

        if (index < 0) {
            return;
        }

        this.ids.splice(index, 1);

    }

    setIds(ids) {
        this.ids = ids;
    }

    getIds() {
        return [...this.ids];
    }

    setTitle(title) {
        this.title.textContent = title;
    }

    setTokenStore(tokenStore) {
        this.tokenStore = tokenStore;
    }

    setEntryTemplate(entryTemplate) {
        this.entryTemplate = entryTemplate;
    }

    getCharacters() {

        const {
            tokenStore
        } = this;

        if (!tokenStore) {
            throw new Error("tokenStore has not been set");
        }

        return this.ids.map((id) => tokenStore.getCharacter(id));

    }

    getMultipleTitle() {
        return this.multipleTitle || this.title.dataset.multiple;
    }

    setMultipleTitle(multipleTitle) {
        this.multipleTitle = multipleTitle;
    }

    drawCharacters() {

        const {
            holder,
            entryTemplate
        } = this;

        if (!entryTemplate) {
            throw new Error("entryTemplate has not been set");
        }

        const characters = this.getCharacters();
        const isMultiple = characters.length > 1;

        replaceContentsMany(
            holder,
            characters.map((character) => entryTemplate.draw({
                ".js--token--show"(element) {
                    element.append(character.drawToken());
                },
                ".js--token--ability"(element) {
                    element.textContent = character.getAbility();
                    element.hidden = isMultiple;
                }
            }))
        );

        this.setTitle(
            isMultiple
            ? this.getMultipleTitle()
            : characters[0].getName()
        );
        holder.classList.toggle("is-multiple", isMultiple);

    }

}
