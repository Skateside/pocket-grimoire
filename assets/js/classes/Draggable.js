/**
 * A class that allows elements to be draggable.
 */
export default class Draggable {

    /**
     * Default settings for {@link Draggable#settings}.
     * @type {Object}
     */
    static defaults = {
        childClass: "is-draggable",
        dragClass: "is-dragging",
        dragSelector: "[draggable]"
    };

    /**
     * @param {Element} container
     *        The container in which all the draggable elements will be.
     * @param {Object} [settings]
     *        Optional settings for the class instance.
     */
    constructor(container, settings) {

        /**
         * Container in which all the draggable elements will be. Elements can
         * only be dropped within this container.
         * @type {Element}
         */
        this.container = container;

        /**
         * Settings for the instance.
         * @type {Object}
         */
        this.settings = Object.assign({}, Draggable.defaults, settings || {});

        /**
         * A collection of all the draggable children within
         * {@link Draggable#container}.
         * @type {Set.<Element>}
         */
        this.children = new Set();

        /**
         * The child currently be dragged, if there is one.
         * @type {Element|null}
         */
        this.dragged = null;

        this.createHandlers();
        this.addEventListeners();

    }

    /**
     * Creates the {@link Draggable#onChildDragStart} and
     * {@link Draggable#onChildDragEnd} methods.
     */
    createHandlers() {

        const {
            dragClass,
            dragSelector
        } = this.settings;

        /**
         * Handles the user starting to drag a child element. This is a
         * generated method, rather than being part of the prototype, so that it
         * can be added/removed by reference in {@link Draggable#addChild} and
         * {@link Draggable#removeChild}.
         *
         * @param {Event} event
         *        Either a "dragstart" or a "touchstart" event.
         */
        this.onChildDragStart = (event) => {

            const {
                target,
                dataTransfer
            } = event;

            // When using touch events, the target can be a [draggable] child.
            const child = target.closest(dragSelector);

            child.classList.add(dragClass);

            // dataTransfer property only exists with "drop" events.
            if (dataTransfer) {

                dataTransfer.effectAllowed = "move";
                dataTransfer.setData("text/plain", null); // Needed for Firefox.

            }

            this.dragged = child;

        };

        /**
         * Handles the user no longer dragging a child element. This is a
         * generated method, rather than being part of the prototype, so that it
         * can be added/removed by reference in {@link Draggable#addChild} and
         * {@link Draggable#removeChild}.
         *
         * @param {Event} event
         *        Either a "dragend" or a "touchend" event.
         */
        this.onChildDragEnd = (event) => {
            event.target.closest(dragSelector)?.classList.remove(dragClass);
        };

    }

    /**
     * Identifies the within the given collection of children that is closest to
     * the given X and Y co-ordinates.
     *
     * @param  {Element[]} children
     *         Collection of elements to check.
     * @param  {Number} x
     *         X co-ordinate.
     * @param  {Number} y
     *         Y co-ordinate.
     * @return {Element|undefined}
     *         Either the closest element, or undefined if the children
     *         parameter is an empty list.
     */
    getClosestElement(children, x, y) {

        return [...children].reduce((closest, child) => {

            const box = child.getBoundingClientRect();
            const xDistance = x - box.left - box.width / 2;
            const yDistance = y - box.top - box.height / 2;
            const offset = Math.sqrt(xDistance**2 + yDistance**2);

            if (offset < closest.offset) {

                return {
                    offset,
                    element: child
                };

            }

            return closest;

        }, { offset: Number.POSITIVE_INFINITY }).element;

    }

    /**
     * Checks to see if the given target element is before or after the source
     * element in the DOM list.
     *
     * @param  {Element} target
     *         Target element to check.
     * @param  {Element} source
     *         Source element to check against.
     * @return {Boolean}
     *         true if the target is before the source, false otherwise.
     * @see    https://stackoverflow.com/a/28962290/557019
     */
    isBefore(target, source) {

        if (target.parentNode === source.parentNode) {

            for (
                let current = target.previousSibling;
                current && current.nodeType !== Node.DOCUMENT_NODE;
                current = current.previousSibling
            ) {

                if (current === source) {
                    return true;
                }

            }

        }

        return false;

    }

    /**
     * Handles the moving of the element currently stored in
     * {@link Draggable#dragged} - if there is no element stored there then this
     * function ends early.
     *
     * @param {Event} event
     *        Either a "dragover" or a "touchmove" event.
     */
    move(event) {

        const {
            dataTransfer,
            targetTouches
        } = event;
        const pointer = (
            targetTouches
            ? targetTouches[0]
            : event
        );
        const {
            dragged,
            children,
            container
        } = this;

        if (!pointer || !dragged) {
            return;
        }

        event.preventDefault();

        // dataTransfer is only a property with "drop" events.
        if (dataTransfer) {
            dataTransfer.dropEffect = "move";
        }

        const closest = this.getClosestElement(
            children,
            pointer.clientX,
            pointer.clientY
        );

        if (!closest) {
            return;
        }

        container.insertBefore(
            dragged,
            (
                this.isBefore(dragged, closest)
                ? closest
                : closest.nextElementSibling
            )
        );

    }

    /**
     * Adds event listeners to {@link Draggable#container}.
     */
    addEventListeners() {

        const {
            container
        } = this;

        container.addEventListener("dragover", (e) => this.move(e));
        container.addEventListener("touchmove", (e) => this.move(e));
        container.addEventListener("drop", (e) => e.preventDefault());

    }

    /**
     * Handles a child element being added to {@link Draggable#container}.
     *
     * @param {Element} child
     *        The child element that has been added.
     */
    addChild(child) {

        child.classList.add(this.settings.childClass);
        child.setAttribute("draggable", true);
        child.addEventListener("dragstart", this.onChildDragStart);
        child.addEventListener("dragend", this.onChildDragEnd);
        child.addEventListener("touchstart", this.onChildDragStart);
        child.addEventListener("touchend", this.onChildDragEnd);
        this.children.add(child);

    }

    /**
     * Handles a child element being removed from {@link Draggable#container}.
     *
     * @param {Element} child
     *        The child element that has been removed.
     */
    removeChild(child) {

        const {
            children
        } = this;

        if (!children.has(child)) {
            return;
        }

        child.classList.remove(this.settings.childClass);
        child.removeAttribute("draggable");
        child.removeEventListener("dragstart", this.onChildDragStart);
        child.removeEventListener("dragend", this.onChildDragEnd);
        child.removeEventListener("touchstart", this.onChildDragStart);
        child.removeEventListener("touchend", this.onChildDragEnd);
        children.delete(child);

    }

    /**
     * A helper function for children stored in {@link Draggable#children} from
     * {@link Draggable#container}.
     */
    removeAllChildren() {
        [...this.children].forEach((child) => this.removeChild(child));
    }

}
