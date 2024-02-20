import {
    identify,
    lookupOne
} from "../utils/elements.js";
import {
    markdown2html,
    striptags
} from "../utils/strings.js";

/**
 * Handles info tokens.
 */
export default class InfoToken {

    /**
     * The prefix for the ID of any info token dialog.
     * @type {String}
     */
    static get ID_PREFIX() {
        return "info-token-";
    }

    /**
     * Stores templates that all info tokens will refer to.
     *
     * @param {Object} templates
     *        A list of all templates that the info tokens will refer to.
     */
    static setTemplates(templates) {

        /**
         * A list of all templates that this info tokens will refer to.
         * @type {Object}
         */
        this.templates = templates;

    }

    /**
     * Stores holders that all info tokens will draw to.
     *
     * @param {Object} templates
     *        A list of all templates that the info tokens will refer to.
     */
    static setHolders(holders) {

        /**
         * A list of all holders that this info tokens will draw to.
         * @type {Object}
         */
        this.holders = holders;

    }

    /**
     * Converts the text into a unique ID.
     *
     * @param  {String} text
     *         Text to act as a prefix for the ID.
     * @return {String}
     *         Unique ID.
     */
    static makeId(text) {

        const lower = text.replace(/\W/g, "").toLowerCase();

        return identify({}, `${this.ID_PREFIX}${lower}-`);

    }

    /**
     * Interprets the given object to make sure it has the correct keys for the
     * data.
     *
     * @param  {Object} data
     *         Data to interpret.
     * @param  {String} [raw]
     *         The raw text to convert into markup (markdown).
     * @param  {String} markup
     *         Markup for the dialog box.
     * @param  {String} [id]
     *         ID for the dialog box. If ommitted, one will be generated - see
     *         {@link InfoToken.makeId}.
     * @param  {String} [colour="grey"]
     *         Colour of the button and dialog box.
     * @param  {Boolean} [custom=false]
     *         Whether or not the info token is custom-made.
     * @return {Object}
     *         Interpretted data.
     */
    static interpret({ raw, markup, id, colour, custom }) {

        if (raw && !markup) {
            markup = markdown2html(raw);
        }

        const text = striptags(markup);

        if (!id) {
            id = this.makeId(text);
        }

        const prefix = this.ID_PREFIX;

        if (!id.startsWith(prefix)) {
            id = `${prefix}${id}`;
        }

        return {
            raw,
            text,
            markup,
            id,
            colour: `var(--${colour || "grey"})`,
            custom: Boolean(custom)
        };

    }

    /**
     * @param {Object} data
     *        Data for the info token.
     */
    constructor(data) {

        /**
         * Interpretted data - see {@link InfoToken.interpret}.
         * @type {Object}
         */
        this.data = this.constructor.interpret(data);

    }

    /**
     * A helper function for drawing all the elements.
     */
    draw() {

        this.drawTrigger();
        this.drawDialog();

    }

    /**
     * Draws the button and adds it to the correct holder.
     */
    drawTrigger() {

        const {
            text,
            id,
            colour,
            custom
        } = this.data;
        const {
            holders,
            templates
        } = this.constructor;
        const holder = holders[
            custom
            ? "custom"
            : "button"
        ];

        const trigger = templates.button.draw({
            ".js--info-token--button"(element) {

                element.textContent = text;
                element.style.setProperty("--bg-colour", colour);
                element.dataset.dialog = `#${id}`;

            }
        });

        holder.append(trigger);

        /**
         * The wrapper list item that holds the button that triggers
         * {@link InfoToken#dialog}.
         * @type {Element}
         */
        this.trigger = holder.lastElementChild;

    }

    /**
     * Draws the dialog and adds it to the correct holder.
     */
    drawDialog() {

        const {
            markup,
            id,
            colour,
            custom
        } = this.data;
        const {
            holders,
            templates
        } = this.constructor;
        const holder = holders.dialog;

        const dialog = templates.dialog.draw({
            ".js--info-token--dialog"(element) {

                element.id = id;
                element.style.setProperty("--colour", colour);

            },
            ".js--info-token--dialog-text"(element) {
                element.innerHTML = markup;
            },
            ".js--info-token--actions"(element) {
                element.hidden = !custom;
            }
        });

        holder.append(dialog);

        /**
         * The dialog element for this info token.
         * @type {Element}
         */
        this.dialog = holder.lastElementChild;

    }

    /**
     * Exposes a copy of {@link InfoToken#data}.
     *
     * @return {Object}
     *         A copy of the info token's data.
     */
    getData() {

        return {
            ...this.data
        };

    }

    /**
     * Exposes the "raw" key from {@link InfoToken#data}.
     *
     * @return {String}
     *         The raw markdown.
     */
    getRaw() {
        return this.data.raw;
    }

    /**
     * Exposes {@link InfoToken#trigger}
     *
     * @return {Element}
     *         Trigger element.
     */
    getTrigger() {
        return this.trigger;
    }

    /**
     * Exposes {@link InfoToken#dialog}
     *
     * @return {Element}
     *         Dialog element.
     */
    getDialog() {
        return this.dialog;
    }

    /**
     * Updates the contents of the info token based on the raw input given.
     *
     * @param {String} raw
     *        Markdown that should be updated.
     */
    updateRaw(raw) {

        const {
            data,
            dialog,
            trigger
        } = this;

        const markup = markdown2html(raw);
        const text = striptags(markup);

        data.raw = raw;
        data.text = text;
        lookupOne(".js--info-token--button", trigger).textContent = text;
        data.markup = markup;
        lookupOne(".js--info-token--dialog-text", dialog).innerHTML = markup;

    }

    /**
     * Removes the elements that were added to the DOM for this info token.
     */
    remove() {

        this.dialog.remove();
        this.trigger.remove();

    }

}
