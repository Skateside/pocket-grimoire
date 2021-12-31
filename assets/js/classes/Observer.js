/**
 * Listens for and dispatches events.
 */
export default class Observer {

    /**
     * A cache of all observers created using {@link Observer.create}.
     * @type {Object}
     */
    static observers = Object.create(null);

    /**
     * A helper function for creating/getting observers.
     *
     * @param  {String} name
     *         Name of the observer.
     * @return {Observer}
     *         Observer instance.
     */
    static create(name) {

        const {
            observers
        } = this;

        if (!observers[name]) {
            observers[name] = new this();
        }

        return observers[name];

    }

    /**
     * Creates the observer.
     */
    constructor() {

        /**
         * A dummy element that has the events bound to it.
         * @type {Element}
         */
        this.dummy = document.createElement("div");

    }

    /**
     * Listens for an event and binds the given handler to it.
     *
     * @param {String} eventName
     *        Name of the event to listen for.
     * @param {Function} handler
     *        Handler to execute when the event is heard.
     */
    on(eventName, handler) {
        this.dummy.addEventListener(eventName, handler);
    }

    /**
     * Removes a handler from the given event.
     *
     * @param {String} eventName
     *        Name of the event.
     * @param {Function} handler
     *        Handler to remove from the event.
     */
    off(eventName, handler) {
        this.dummy.removeEventListener(eventName, handler);
    }

    /**
     * Creates an event.
     *
     * @param  {String} eventName
     *         Name of the event to create.
     * @param  {?} [detail]
     *         Optional detail for the event.
     * @return {CustomEvent}
     *         Event that was created.
     */
    create(eventName, detail) {

        return new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail
        });

    }

    /**
     * Dispatches an event and returns it.
     *
     * @param  {CustomEvent|String} eventName
     *         Either the event to trigger or the name of the event to trigger.
     * @param  {?} [detail]
     *         Optional detail for the event. This parameter is only used if the
     *         eventName parameter is a string and the event is created.
     * @return {CustomEvent}
     *         Event that was dispatched.
     */
    trigger(eventName, detail) {

        const event = (
            typeof eventName === "string"
            ? this.create(eventName, detail)
            : eventName
        );

        this.dummy.dispatchEvent(event);

        return event;

    }

}
