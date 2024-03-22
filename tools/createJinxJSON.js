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

    return data;

}

function copyJinx(raw) {
    copy(JSON.stringify(createJinxJSON(raw), null, "    "));
}
