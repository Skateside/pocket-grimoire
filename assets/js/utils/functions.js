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

/**
 * Debounces a function such that the given function will only execute after it
 * is no longer being called for the given delay.
 *
 * @param  {Function} func
 *         Function to debounce.
 * @param  {number} [delay=500]
 *         Delay in milliseconds
 * @return Debounced function.
 */
export function debounce(func, delay = 500) {

    let context = this;
    let timeout = 0;

    return function (...args) {

        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            func.apply(context, args);
        }, delay);

    };

};
