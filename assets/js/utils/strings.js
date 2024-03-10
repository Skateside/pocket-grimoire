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

/**
 * Removes any HTML markup from the given string.
 *
 * @param  {String} string
 *         String from which HTML markup should be removed.
 * @return {String}
 *         String without any HTML markup.
 * @see    https://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/
 */
export function striptags(string) {
    return String(string).replace(/(<([^>]+)>)/gi, "");
}

/**
 * A simple function that converts the double asterists into strong tags.
 *
 * @param  {String} string
 *         Text to convert.
 * @return {String}
 *         Converted text.
 */
export function markdown2html(string) {
    return string.replace(/\*\*([^*]*)\*\*/g, "<strong>$1</strong>");
}

/**
 * Replaces placeholders in the given string with the replacements provided.
 *
 * @param  {String} template
 *         String with placeholders to replace.
 * @param  {Array|Object} replacements
 *         Replacements to populate the string.
 * @return {String}
 *         String with replacements.
 */
export function supplant(template, replacements) {

    return template.replace(/\{([^{}]*)\}/g, (whole, index) => (
        Object.prototype.hasOwnProperty.call(replacements, index)
        ? replacements[index]
        : whole
    ));

}
