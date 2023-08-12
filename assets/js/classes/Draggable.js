export default class Draggable {

    static defaults = {
        dragClass: "is-dragging"
    };

    constructor(container, settings) {

        this.container = container;
        this.settings = Object.assign({}, Draggable.defaults, settings || {});
        this.children = new Set();
        this.dragged = null;

        this.createHandlers();
        this.addEventListeners();

    }

    createHandlers() {

        const {
            dragClass
        } = this.settings;

        // [1] This was the `draggable` variable - e.target might not be a proper fit.

        this.onChildDragStart = (e) => {

            e.target.classList.add(dragClass); // [1]
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", null); // Needed for Firefox
            this.dragged = e.target;

        };

        this.onChildDragEnd = (e) => {
            e.target.classList.remove(dragClass); // [1]
        };

    }

    getClosestElement(children, x, y) {

        return Array.prototype.reduce.call(children, (closest, child) => {

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

    // https://stackoverflow.com/a/28962290/557019
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

    addEventListeners() {

        const {
            container,
            children
        } = this;

        container.addEventListener("dragover", (e) => {

            e.preventDefault();
            e.dataTransfer.dropEffect = "move";

            const closest = this.getClosestElement(
                children,
                e.clientX,
                e.clientY
            );

            container.insertBefore(
                this.dragged,
                (
                    this.isBefore(this.dragged, closest)
                    ? closest
                    : closest.nextElementSibling
                )
            );

        });

        container.addEventListener("drop", (e) => {
            e.preventDefault();
        });

    }

    addChild(child) {

        child.addEventListener("dragstart", this.onChildDragStart);
        child.addEventListener("dragend", this.onChildDragEnd);
        this.children.add(child);

    }

    removeChild(child) {

        const {
            children
        } = this;

        if (!children.has(child)) {
            return;
        }

        child.removeEventListener("dragstart", this.onChildDragStart);
        child.removeEventListener("dragend", this.onChildDragEnd);
        children.delete(child);

    }

}
