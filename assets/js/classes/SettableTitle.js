/**
 * Manages a title that can be set.
 */
export default class SettableTitle {

    /**
     * @param  {HTMLElement} title
     *         The title element that will display normally displayed.
     * @param  {HTMLElement} input
     *         The input element that will allow the title to be set.
     * @throws {Error}
     *         `title` and `input` must exist and `input` must have a `list`.
     */
    constructor(title, input) {

        /**
         * The title element that will display normally displayed.
         * @type {HTMLElement}
         */
        this.title = title;

        /**
         * The input element that will allow the title to be set.
         * @type {HTMLElement}
         */
        this.input = input;

        /**
         * The data list for {@link SettableTitle#input}.
         * @type {HTMLElement}
         */
        this.list = input.list;

        if (!this.title || !this.input || !this.list) {
            throw new Error("Settable title not properly configured");
        }

        /**
         * The form that enwraps {@link SettableTitle#input}. This element might
         * not exist.
         * @type {HTMLElement|null}
         */
        this.form = input.form;

        /**
         * The option within {@link SettableTitle#list} that displays the
         * original, starting value of the title.
         * @type {HTMLElement}
         */
        this.start = this.list.querySelector(".js--settable-title--start");
        this.start.value = title.textContent;

        /**
         * The option within {@link SettableTitle#list} that displays the
         * value that the user most recently inputted.
         * @type {HTMLElement}
         */
        this.previous = this.list.querySelector(".js--settable-title--previous");

        this.addListeners();

    }

    /**
     * Adds event listeners to key elements.
     */
    addListeners() {

        const {
            title,
            input,
            form
        } = this;

        title.addEventListener("click", () => {

            this.showInput();
            input.focus();

        });

        input.addEventListener("focus", () => {
            input.value = "";
        });

        input.addEventListener("blur", () => {

            this.hideInput();
            this.updatePrevious();

        });

        input.addEventListener("input", () => {

            this.setTitle(input.value);
            this.announceUpdate();

        });

        form?.addEventListener("submit", (e) => {

            e.preventDefault();
            e.stopPropagation();
            input.blur();

        });

    }

    /**
     * Checks to see if {@link SettableTitle#input} is currently visible.
     *
     * @return {Boolean}
     *         `true` if {@link SettableTitle#input} is currently visible,
     *         `false` otherwise.
     */
    isShowingInput() {
        return !this.input.hidden;
    }

    /**
     * Toggles the visibility of {@link SettableTitle#input} (and, by extension,
     * {@link SettableTitle#title}). Optionally, the visibility state can be
     * forced by passing a boolean to this function. If this function attempts
     * to set the visibility state to the same as the current state, no action
     * is taken.
     *
     * @param {Boolean} [forceState]
     *        Optional state to force. If ommitted, the visibility is simply
     *        toggled.
     */
    toggleInput(forceState) {

        if (forceState === undefined) {
            forceState = !this.isShowingInput();
        }

        if (forceState === this.isShowingInput()) {
            return;
        }

        const {
            title,
            input
        } = this;

        title.hidden = forceState;
        input.hidden = !forceState;

    }

    /**
     * A helper function that makes the input visible. See
     * {@link SettableTitle#toggleInput}.
     */
    showInput() {
        this.toggleInput(true);
    }

    /**
     * A helper function that makes the input invisible. See
     * {@link SettableTitle#toggleInput}.
     */
    hideInput() {
        this.toggleInput(false);
    }

    /**
     * Updates the value of {@link SettableTitle#previous} if it exists and the
     * value is not empty.
     */
    updatePrevious() {

        const {
            input,
            previous
        } = this;

        if (previous && input.value) {
            previous.value = input.value;
        }

    }

    /**
     * Sets the text of {@link SettableTitle#title} to the given title. If the
     * given title is empty, the value returned by
     * {@link SettableTitle#getStartText} is used instead.
     *
     * @param {String} title
     *        Title to set.
     */
    setTitle(title) {
        this.title.textContent = title || this.getStartText();
    }

    /**
     * Exposes the current text of {@link SettableTitle#title}.
     *
     * @return {String}
     *         Current text of {@link SettableTitle#title}.
     */
    getTitle() {
        return this.title.textContent;
    }

    /**
     * Exposes {@link SettableTitle#form}.
     *
     * @return {HTMLElement|null}
     *         Form element.
     */
    getForm() {
        return this.form;
    }

    /**
     * Sets the text of {@link SettableTitle#start}. If that element doesn't
     * exist then no action is taken.
     *
     * @param {String} text
     *        Starting text.
     */
    setStartText(text) {

        const {
            start
        } = this;

        if (start) {
            start.value = text;
        }

    }

    /**
     * Gets the text of {@link SettableTitle#start}. If that text cannot be
     * worked out, an empty string is returned.
     *
     * @return {String}
     *         Starting text.
     */
    getStartText() {
        return this.start?.value || "";
    }

    /**
     * A function that's executed whenever the value of
     * {@link SettableTitle#input} is updated.
     */
    announceUpdate() {
        return;
    }

}
