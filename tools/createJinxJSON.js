function createJinxJSON(lang) {

    const rows = lang.trim().split("\n").map((row) => row.split("\t"));
    const keys = [
        "target",
        "trick",
        "reason"
    ];
    const data = rows.map((row) => row.reduce((data, cell, i) => {
        return Object.assign(data, { [keys[i]]: cell });
    }, {}));

    // Validate the language.
    data.forEach((row) => {
        if (!keys.every((key) => Object.hasOwn(row, key))) {
            console.warn("Invalid data for %o", row);
        }
    });

    return data;

}

function copyJinx(raw) {
    copy(JSON.stringify(createJinxJSON(raw), null, "    "));
}
