import Observer from "../../classes/Observer.js";
import Template from "../../classes/Template.js";
import CharacterToken from "../../classes/CharacterToken.js";
import ReminderToken from "../../classes/ReminderToken.js";
import Dialog from "../../classes/Dialog.js";
import Names from "../../classes/Names.js";
import {
    lookup,
    lookupOne,
    lookupOneCached
} from "../../utils/elements.js";

CharacterToken.setTemplates({
    token: Template.create(lookupOne("#character-template")),
    list: Template.create(lookupOne("#character-list-template")),
    select: Template.create(lookupOne("#character-select-template")),
    nightOrder: Template.create(lookupOne("#night-info-template"))
});
ReminderToken.setTemplates({
    token: Template.create(lookupOne("#reminder-template")),
    list: Template.create(lookupOne("#reminder-list-template"))
});
Names.create()
    .setTemplate(Template.create(lookupOne("#player-name-template")))
    .setObserver(new Observer());

// Delegate this event for two reasons:
// 1. We can add dialogs dynamically and they'll still work.
// 2. It's more efficient to only create the instance when it's needed.
document.body.addEventListener("click", ({ target }) => {

    if (target.hasAttribute("data-dialog") && !target.dialog) {

        target.dialog = Dialog.createFromTrigger(target);
        target.dialog.show();

    }

});

lookup("input[data-filter-list]").forEach((input) => {

    input.addEventListener("change", ({ target }) => {

        const list = lookupOneCached(target.dataset.filterList);

        if (!list) {
            return;
        }

        list.classList.toggle("is-show-all", target.checked);

    });

});

lookupOne("#locale-form").addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = lookupOneCached("#select-locale").value;
});

lookupOneCached("#select-locale").addEventListener("change", ({ target }) => {
    target.form.requestSubmit();
});

function setTrackWidth(input) {

    const {
        min,
        max,
        value
    } = input;

    input.style.setProperty(
        "--size",
        ((value - min) * 100) / (max - min)
    );

}

const rangeObserver = new MutationObserver((entries) => {

    entries.forEach(({ type, target }) => {

        if (type == "attributes") {
            setTrackWidth(target);
        }

    });

});

lookup("input[type=\"range\"][data-output]").forEach((input) => {

    const output = lookupOne(input.dataset.output);

    input.addEventListener("input", () => {

        setTrackWidth(input);

        if (output) {
            output.value = input.value
        }

    });

    setTrackWidth(input);
    rangeObserver.observe(input, {
        attributes: true,
        attributeFilter: ["min", "max", "value"]
    });

});
