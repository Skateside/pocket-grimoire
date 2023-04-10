import {
    times,
    toRadians
} from "../utils/numbers.js";

export default class Positioner {

    static layouts = {

        // https://stackoverflow.com/a/26601039/557019
        ellipse(data) {

            const {
                width,
                height,
                tokenWidth,
                tokenHeight,
                total
            } = data;
            const coordinates = [];
            const radiusX = (width - tokenWidth) / 2;
            const radiusY = (height - tokenHeight) / 2;

            times(total, (index) => {

                const theta = toRadians((360 / total) * index);
                coordinates[index] = [
                    radiusX + radiusX * Math.sin(theta),
                    radiusY - radiusY * Math.cos(theta)
                ];

            });

            return coordinates;

        },

        diagonal(data) {

            const {
                width,
                height,
                tokenWidth,
                tokenHeight,
                total
            } = data;
            const coordinates = [];
            const xIncrement = (width - tokenWidth) / total;
            const yIncrement = (height - tokenHeight) / total;

            times(total, (index) => {
                coordinates[index] = [xIncrement * index, yIncrement * index];
            });

            return coordinates;

        },

        horizontal(data) {
            return Positioner.layouts.diagonal(data).map(([x, y]) => [x, 0]);
        },

        vertical(data) {
            return Positioner.layouts.diagonal(data).map(([x, y]) => [0, y]);
        }

    };

    constructor() {

        this.setDefaults();

    }

    setDefaults() {

        this.setContainerSize(0, 0);
        this.setTokenSize(0, 0);
        this.setTotal(0);

    }

    setContainerSize(width, height) {
        this.width = width;
        this.height = height;
    }

    setTokenSize(tokenWidth, tokenHeight) {
        this.tokenWidth = tokenWidth;
        this.tokenHeight = tokenHeight;
    }

    setTotal(total) {
        this.total = total;
    }

    setLayout(layout) {
        this.layout = layout;
    }

    getData() {

        return Object.freeze({
            width: this.width,
            height: this.height,
            tokenWidth: this.tokenWidth,
            tokenHeight: this.tokenHeight,
            total: this.total
        });

    }

    generateCoords() {

        const {
            constructor: {
                layouts
            },
            layout
        } = this;
        const method = layouts[layout];

        if (!method) {
            throw new ReferenceError(`Unrecognised layout type "${layout}"`);
        }

        return method(this.getData());

    }

}
