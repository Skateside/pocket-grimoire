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

/**
 * Interprets the bytes within a string as UTF-8. We need this when importing
 * JSON - for some reason it struggles to understand accented characters.
 *
 * @param  {String} bytes
 *         String to convert.
 * @return {String}
 *         Converted string.
 * @see    https://stackoverflow.com/a/24282873/557019
 */
export function readUTF8(bytes) {

    const {
        length
    } = bytes;
    let index = bytes.slice(0, 3) === "\xEF\xBB\xBF" ? 3 : 0;
    let string = "";

    while (index < length) {

        const byte1 = (bytes[index] || "").charCodeAt(0);
        const byte2 = (bytes[index + 1] || "").charCodeAt(0);
        const byte3 = (bytes[index + 2] || "").charCodeAt(0);
        const byte4 = (bytes[index + 3] || "").charCodeAt(0);

        if (byte1 < 0x80) {
            string += String.fromCharCode(byte1);
        } else if (byte1 >= 0xC2 && byte1 < 0xE0) {

            string += String.fromCharCode(
                ((byte1 & 0x1F) << 6)
                + (byte2 & 0x3F)
            );
            index += 1;

        } else if (byte1 > 0XE0 && byte1 < 0xF0) {

            string += String.fromCharCode(
                ((byte1 & 0xFF) << 12)
                + ((byte2 & 0x3F) << 6)
                + (byte3 & 0x3F)
            );
            index += 2;

        } else if (byte1 >= 0xF0 && byte1 < 0xF5) {

            let codepoint = (
                ((byte1 & 0x07) << 18)
                + ((byte2 & 0x3F) << 12)
                + ((byte3 & 0x3F) << 6)
                + (byte4 & 0x3F)
            );
            codepoint -= 0x10000;
            string += String.fromCharCode(
                (codepoint >> 10) + 0xD800,
                (codepoint & 0x3FF) + 0xDC00,
            );
            index += 3;

        }

        index += 1;

    }

    return string;

}
