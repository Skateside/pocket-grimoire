import Observer from "./Observer.js";
import {
    clamp
} from "../utils/numbers.js";
import {
    noop,
    rafThrottle
} from "../utils/functions.js";

/**
 * Handles the tokens being draggable.
 */
export default class Tokens {

    /**
     * @param {Element} pad
     *        The pad that the tokens are dragged around within.
     * @param {Observer} observer
     *        An observer that triggers events at key times.
     */
    constructor(pad, observer) {

        /**
         * The pad that thte tokens are in.
         * @type {Element}
         */
        this.pad = pad;

        /**
         * An observer that triggers events at key times.
         * @type {Observer}
         */
        this.observer = observer;

        this.reset();
        this.updatePadDimensions();
        this.addListeners();

    }

    /**
     * Resets some key properties.
     */
    reset() {

        /**
         * The current z-index. By constantly increasing this, we can always put
         * the most recently touched token on the top, allowing reminders to sit
         * on top of characters, for example.
         * @type {Number}
         */
        this.zIndex = 0;

        /**
         * The handler to be executed when dragging a token or reminder.
         * @type {Function}
         */
        this.dragHandler = noop;

        /**
         * A flag for knowing whether the user intention is dragging or
         * clicking. This only seems to be neeed for the desktop.
         * @type {Boolean}
         */
        this.isDragging = false;

        /**
         * The horizontal offset for the token being dragged.
         * @type {Number}
         */
        this.xOffset = 0;

        /**
         * The vertical offset for the token being dragged.
         * @type {Number}
         */
        this.yOffset = 0;

    }

    /**
     * Updates the record of the dimensions of {@link Tokens#pad}.
     */
    updatePadDimensions() {

        const rect = this.pad.getBoundingClientRect();

        /**
         * The offset left of {@link Token#pad}.
         * @type {Number}
         */
        this.padLeft = rect.left;

        /**
         * The offset top of {@link Token#pad}.
         * @type {Number}
         */
        this.padTop = rect.top;

        /**
         * The width of {@link Token#pad}.
         * @type {Number}
         */
        this.padWidth = rect.width;

        /**
         * The height of {@link Token#pad}.
         * @type {Number}
         */
        this.padHeight = rect.height;

    }

    /**
     * Adds event listeners to key elements.
     */
    addListeners() {

        document.addEventListener("mousedown", this);
        document.addEventListener("touchstart", this);
        document.addEventListener("mouseup", this);
        document.addEventListener("touchend", this);
        document.addEventListener("click", this);
        document.addEventListener("contextmenu", this);
        window.addEventListener("resize", this);
        window.addEventListener("scroll", this);

        const styleObserver = new MutationObserver(() => {
            this.updatePadDimensions();
        });

        styleObserver.observe(this.pad, {
            attributes: true,
            attributeFilter: ["style"]
        });

    }

    /**
     * Set the zIndex value.
     *
     * @param {Number} zindex
     *        Z-index to set.
     */
    setZIndex(zIndex) {
        this.zIndex = zIndex;
    }

    /**
     * Exposes {@link Tokens#zIndex}.
     *
     * @return {Number}
     *         The current value of {@link Tokens#zIndex}.
     */
    getZIndex() {
        return this.zIndex;
    }

    /**
     * Increases {@link Tokens#zIndex} before returning it.
     *
     * @return {Number}
     *         The next value of {@link Tokens#zIndex}.
     */
    advanceZIndex() {

        this.zIndex += 1;

        return this.zIndex;

    }

    /**
     * Works out the event being heard and executes the correct handler.
     *
     * @param {Event} e
     *        The event that has been heard.
     */
    handleEvent(e) {

        const target = e.target;
        const token = (
            typeof target.closest === "function"
            ? target.closest(".js--token--wrapper")
            : null
        );
        const scollHandler = rafThrottle((e) => this.onScroll(e));

        switch (e.type) {

        case "mousedown":
        case "touchstart":
            this.onMousedown(token, e);
            break;

        case "mouseup":
        case "touchend":
        case "contextmenu":
            this.onMouseup(e);
            break;

        case "click":
            this.onClick(token, e);
            break;

        case "resize":
            this.onResize(e);
            break;

        case "scroll":
            scollHandler(e);
            break;

        }

    }

    /**
     * Handles a mouse down or touch start event.
     *
     * @param {Element} token
     *        The token that has been touched.
     * @param {Event} e
     *        The event.
     */
    onMousedown(token, e) {

        if (!token) {
            return;
        }

        this.startDrag(token, e);

        const zIndex = this.advanceZIndex();
        token.style.setProperty("--z-index", zIndex);

        this.observer.trigger("zindex", {
            zIndex,
            element: token
        });

    }

    /**
     * Handles a mouse up or touch end event.
     *
     * @param {Event} e
     *        The event.
     */
    onMouseup(e) {
        this.endDragging();
    }

    /**
     * Handles a click event.
     *
     * @param {Element} token
     *        The token that has been touched.
     * @param {Event} e
     *        The event.
     */
    onClick(token, e) {

        if (!token || this.isDragging) {
            return;
        }

        const type = token.closest("[data-token]");
        const tokenType = type.dataset.token;

        // character-click or reminder-click event.
        this.observer.trigger(`${tokenType}-click`, {
            element: type
        });

    }

    /**
     * Handles a resize event.
     *
     * @param {Event} e
     *        The event.
     */
    onResize(e) {
        this.updatePadDimensions();
    }

    /**
     * Handles a scroll event.
     *
     * @param {Event} e
     *        The event.
     */
    onScroll(e) {
        this.updatePadDimensions();
    }

    /**
     * Handles the dragging being started.
     *
     * @param {Element} element
     *        The token being dragged.
     * @param {Event} event
     *        The mouse down or touch start event.
     */
    startDrag(element, event) {

        const {
            type,
            clientX,
            clientY,
            targetTouches
        } = event;
        const {
            left,
            top
        } = element.getBoundingClientRect();

        this.endDragging();
        this.dragHandler = (event) => this.dragObject(element, event);

        if (type === "mousedown") {

            this.xOffset = clientX - left + this.padLeft;
            this.yOffset = clientY - top + this.padTop;
            window.addEventListener("mousemove", this.dragHandler);

        } else if (type === "touchstart" && targetTouches.length) {

            this.xOffset = targetTouches[0].clientX - left + this.padLeft;
            this.yOffset = targetTouches[0].clientY - top + this.padTop;
            window.addEventListener("touchmove", this.dragHandler, {
                passive: false
            });

        }

    }

    /**
     * Moves a token being dragged.
     *
     * @param {Element} element
     *        The token being dragged.
     * @param {Event} event
     *        The mouse move or touch move event.
     */
    dragObject(element, event) {

        event.preventDefault();

        const {
            type,
            clientX,
            clientY,
            targetTouches
        } = event;
        const {
            width,
            height
        } = element.getBoundingClientRect();
        let leftValue = 0;
        let topValue = 0;

        if (type === "mousemove") {

            leftValue = clientX - this.xOffset;
            topValue = clientY - this.yOffset;
            this.isDragging = true;

        } else if (type === "touchmove" && targetTouches.length) {

            leftValue = targetTouches[0].clientX - this.xOffset;
            topValue = targetTouches[0].clientY - this.yOffset;

        }

        this.moveTo(
            element,
            clamp(0, leftValue, this.padWidth - width),
            clamp(0, topValue, this.padHeight - height)
        );

    }

    /**
     * Moves the given token element to the co-ordinates given.
     *
     * @param {Element} element
     *        Element to move.
     * @param {Number} left
     *        X co-ordinate.
     * @param {Number} top
     *        Y co-ordinate.
     * @param {Number} [zIndex=this.zIndex]
     *        Optional Z co-ordinate. If ommitted, it defaults to
     *        {@link Tokens#zIndex}.
     */
    moveTo(element, left, top, zIndex) {

        element.style.setProperty("--left", left);
        element.style.setProperty("--top", top);

        if (typeof zIndex !== "number" || Number.isNaN(zIndex)) {
            zIndex = this.zIndex;
        }

        element.style.setProperty("--z-index", zIndex);

        this.observer.trigger("move", {
            element,
            left,
            top,
            zIndex
        });

    }

    /**
     * Exposes the co-ordinates for the given element.
     *
     * @param  {Element} element
     *         Element whose co-ordinates should be returned.
     * @return {coord}
     *         Co-ordinates for the element.
     */
    getPosition(element) {

        /**
         * @typedef  {Object} coord
         * @property {Number} x
         *           The left value in pixels.
         * @property {Number} y
         *           The top value in pixels.
         * @property {Number} z
         *           The z-index in pixels.
         */
        const coord = {
            x: Number(element.style.getPropertyValue("--left")) || 0,
            y: Number(element.style.getPropertyValue("--top")) || 0,
            z: Number(element.style.getPropertyValue("--z-index")) || 0
        };

        return coord;

    }

    /**
     * Handles the token dragging finishing.
     */
    endDragging() {

        if (this.dragHandler !== noop) {

            window.removeEventListener("mousemove", this.dragHandler);
            window.removeEventListener("touchmove", this.dragHandler, {
                passive: false
            });
            this.dragHandler = noop;

            // The order of events is mousedown -> mouseup -> click. This means
            // that we need to delay the resetting of `this.isDragging` so that
            // the handler attached to the click event listener doesn't trigger
            // after dragging. This only seems to be an issue on desktop, mobile
            // seems to be fine.
            window.requestAnimationFrame(() => this.isDragging = false);

        }

    }

}
