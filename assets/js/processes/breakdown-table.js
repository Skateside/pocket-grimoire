import Observer from "../classes/Observer.js";
import Template from "../classes/Template.js";
import {
    lookupOne,
    lookupOneCached,
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const breakdownPlayer = Template.create(lookupOne("#breakdown-player"));
const breakdownTeam = Template.create(lookupOne("#breakdown-team"));

gameObserver.on("team-breakdown-loaded", ({ detail }) => {
    
    const rows = [
        { id: "players", data: [] },
        { id: "townsfolk", data: [] },
        { id: "outsider", data: [] },
        { id: "minion", data: [] },
        { id: "demon", data: [] },
    ];

    detail.breakdown.forEach(({ players, breakdown }) => {
        rows[0].data.push(players === 15 ? `${players}+` : String(players));
        rows[1].data.push(String(breakdown.townsfolk));
        rows[2].data.push(String(breakdown.outsider));
        rows[3].data.push(String(breakdown.minion));
        rows[4].data.push(String(breakdown.demon));
    });

    rows.forEach((row, index) => {

        const tableRow = (
            index === 0
            ? breakdownPlayer
            : breakdownTeam
        ).draw({
            ".js--breakdown--row"(element) {
                element.className = element.className.replace("[id]", row.id);
            },
            ".js--breakdown--heading"(element) {
                element.textContent = window.I18N[row.id] || "";
            },
        });
        const cell = tableRow.querySelector(".js--breakdown--cell");
        const parent = cell.parentElement;
        cell.remove();

        row.data.forEach((datum) => {
            const clone = cell.cloneNode();
            clone.textContent = datum;

            if (clone.hasAttribute("data-count")) {
                clone.dataset.count = String(Number.parseInt(datum, 10));
            }

            parent.append(clone);
        });

        row.element = tableRow;

        lookupOneCached("#breakdown-body").append(tableRow);

    });

});
