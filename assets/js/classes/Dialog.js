/**
 * Wraps the HTML dialogs to add the ability to remotely show/hide them, as well
 * as triggering events when they show/hide.
 */
export default class Dialog {

    /**
     * The show event name.
     * @type {String}
     */
    static get SHOW() {
        return "dialog-show";
    }

    /**
     * The hide event name.
     * @type {String}
     */
    static get HIDE() {
        return "dialog-hide";
    }

    /**
     * An observer that listens for dialogs showing and hiding.
     * @type {MutationObserver}
     */
    static observer = new MutationObserver((mutations) => {

        mutations.forEach(({ target, attributeName }) => {

            target.dispatchEvent(new CustomEvent(
                (
                    target.getAttribute(attributeName) === ""
                    ? this.SHOW
                    : this.HIDE
                ),
                {
                    bubbles: true,
                    cancelable: false
                }
            ));

        });

    });

    /**
     * A cache of all dialog elements to {@link Dialog} instances.
     * @type {WeakMap}
     */
    static cache = new WeakMap();

    /**
     * A helper function that creates a {@link Dialog} instance from the given
     * trigger.
     *
     * @param  {Element} trigger
     *         Trigger element that should make a dialog show when it's clicked.
     * @return {Dialog}
     *         Dialog instance.
     */
    static createFromTrigger(trigger) {

        const selector = trigger.dataset.dialog;
        const dialog = this.create(document.querySelector(selector));

        trigger.addEventListener("click", (e) => {

            e.preventDefault();
            dialog.show();

        });

        return dialog;

    }

    /**
     * Creates a {@link Dialog} instance from the given dialog element.
     *
     * @param  {Element} dialog
     *         Dialog element.
     * @return {Dialog}
     *         Dialog instance.
     */
    static create(dialog) {

        const {
            cache
        } = this;
        let instance = cache.get(dialog);

        if (!instance) {

            instance = new this(dialog);
            cache.set(dialog, instance);

        }

        return instance;

    }

    /**
     * Creates the Dialog instance.
     *
     * @param {Element} dialog
     *        Dialog element.
     */
    constructor(dialog) {

        /**
         * The dialog element that this instance wraps.
         * @type {Element}
         */
        this.dialog = dialog;
        this.constructor.observer.observe(dialog, {
            attributes: true,
            attributeFilter: ["open"]
        });

        this.run();

    }

    /**
     * Processes everything that would need to happen when the dialog instance
     * is created. This allows us to subclass {@link Dialog} more easily.
     */
    run() {
        this.addListeners();
    }

    /**
     * Adds event listeners to key elements.
     */
    addListeners() {

        const {
            dialog
        } = this;
        const hideOn = (
            dialog.getAttribute("data-dialog-hide-on")?.trim().split(/\s/) || []
        );

        if (hideOn.includes("click")) {
            dialog.addEventListener("click", () => this.hide());
        }

        if (hideOn.includes("backdrop")) {

            dialog.addEventListener("click", ({ target }) => {

                if (!dialog.firstElementChild.contains(target)) {
                    this.hide();
                }

            });

        }

        dialog.addEventListener("click", ({ target }) => {

            const hide = target.closest("[data-dialog-hide]");

            if (hide) {
                this.hide();
            }

        });

    }

    /**
     * Makes the dialog show.
     */
    show() {
        this.dialog.showModal();
    }

    /**
     * Makes the dialog hide.
     */
    hide() {
        this.dialog.close();
    }

    /**
     * Exposes {@link Dialog#dialog}.
     *
     * @return {Element}
     *         Dialog element.
     */
    getElement() {
        return this.dialog;
    }

    /**
     * Binds a handler to an event that's triggered on {@link Dialog#dialog}.
     *
     * @param {String} eventName
     *        Name of the event to listen for.
     * @param {Function} handler
     *        Handler to execute when the event is heard.
     */
    on(eventName, handler) {
        this.dialog.addEventListener(eventName, handler);
    }

    /**
     * Removes a handler from an event that's triggered on
     * {@link Dialog#dialog}.
     *
     * @param {String} eventName
     *        Name of the event whose handler should be removed.
     * @param {Function} handler
     *        Handler to remove.
     */
    off(eventName, handler) {
        this.dialog.removeEventListener(eventName, handler);
    }

}
