import Dialog from "./Dialog.js";
import Template from "./Template.js";
import {
    lookupOne
} from "../utils/elements.js";

const dialogList = lookupOne('main');
const buttonList = lookupOne('#info-tokens ul.button-list', dialogList);
const buttonTemplate = Template.create(lookupOne("#info-token-button-template"));
const dialogTemplate = Template.create(lookupOne("#info-token-dialog-template"));
const colours = ['brown', 'red', 'cyan', 'blue', 'dark-orange', 'green', 'dark-purple', 'lime', 'orange', 'yellow', 'dark-yellow', 'purple'];
const reButton = /\*\*/gi;
const reDialog = /\*\*([^*]*)\*\*/gi;

export function addCustomInfoToken(txt) {

    var colour = colours[Math.random() * colours.length>>0];
    var dialogId = "info-token-custom"+Math.floor(Math.random() * 1000000000);
    var buttonTxt = txt.replace(reButton, '');
    var dialogTxt = txt.replace(reDialog, '<strong>$1</strong>');

    // Add button
    buttonList.append(
        buttonTemplate.draw([
            [
                ".js--info-token--button",
                buttonTxt,
                (element, content) => {

                    Template.append(element, content);
                    element.dataset.dialog = "#"+dialogId;
                    element.setAttribute("style", "--bg-colour: var(--"+colour+");");

                }
            ]
        ])
    );

    // Add dialog
    dialogList.append(
        dialogTemplate.draw([
            [
                ".js--info-token--dialog",
                "",
                (element) => {

                    element.id = dialogId;
                    element.classList.add("info-token--"+colour);
                    element.setAttribute("style", "--colour: var(--"+colour+");");

                }
            ],
            [
                ".js--info-token--dialog-text",
                dialogTxt,
                (element, content) => {

                    element.innerHTML = content;

                }
            ]
        ])
    );

    // Activate the dialog
    var trigger = lookupOne("li button[data-dialog='#"+dialogId+"']", buttonList);
    trigger.dialog = Dialog.createFromTrigger(trigger);

}
