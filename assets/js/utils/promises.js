/**
 * Creates a Promise that can be resolved externally.
 *
 * @return {Promise}
 *         A Promise that can be externally resolved or rejected.
 */
export function defer() {

    let res = () => {};
    let rej = () => {};

    const promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
    });

    promise.resolve = res;
    promise.reject = rej;

    return promise;

}
