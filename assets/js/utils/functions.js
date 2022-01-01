/**
 * A no-operation function. It takes no parameters and returns no value.
 */
export function noop() {
    return;
}

/**
 * Throttles the given function using window.requestAnimationFrame()
 *
 * @param  {Function} func
 *         Function that should be throttled.
 * @return {Function}
 *         Throttled function.
 */
export function rafThrottle(func) {

    let context = this;
    let active = true;

    return function (...args) {

        if (!active) {
            return;
        }

        active = false;
        window.requestAnimationFrame(() => {

            active = true;
            func.apply(context, args);

        });

    };

};
