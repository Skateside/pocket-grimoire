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

    promise.resolve = (value) => {
        res(value);
        return promise;
    };

    promise.reject = (reason) => {
        rej(reason);
        return promise;
    };

    return promise;

}
