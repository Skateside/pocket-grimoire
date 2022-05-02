import {
    HASH
} from "../constants/hash.js";

/**
 * Adds a hash to the give URL, just before the file extension. If the hash is
 * empty then it isn't added.
 *
 * @param  {String} url
 *         URL to modify.
 * @return {Stirng}
 *         Modified URL.
 */
export function hash(url) {

    // `!HASH` was being removed by the transpiler for some reason, but
    // `Boolean(HASH)` remains, so we're using that instead.
    const hasHash = Boolean(HASH);

    if (!hasHash) {
        return url;
    }

    const index = url.lastIndexOf(".");

    return (
        url.slice(0, index)
        + "." + HASH
        + url.slice(index)
    );

}
