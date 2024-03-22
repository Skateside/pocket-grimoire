function createLangJSON(lang) {

    const rows = lang.trim().split("\n").map((row) => row.split("\t"));
    const keys = [
        "id",
        "name",
        "ability",
        "firstNightReminder",
        "otherNightReminder",
        "remindersGlobal",
        "reminders"
    ];
    const data = rows.map((row) => row.reduce((data, cell, i) => {
        return Object.assign(data, { [keys[i]]: cell });
    }, {}));
    const complete = data.map((row) => {
        row.reminders = (
            row.reminders
            ? row.reminders.split(/\s*,\s*/)
            : []
        );
        row.remindersGlobal = (
            row.remindersGlobal
            ? row.remindersGlobal.split(/\s*,\s*/)
            : []
        );
        return row;
    });

    return complete;

}

function copyLang(raw) {
    copy(JSON.stringify(createLangJSON(raw), null, "    "));
}
