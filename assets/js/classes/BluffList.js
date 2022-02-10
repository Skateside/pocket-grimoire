export default class BluffList {

    constructor(list, dialog) {

        this.list = list;
        this.dialog = dialog;

    }

    open(bluff) {

        this.bluff = bluff;
        this.dialog.display(character);
        this.dialog.show();

    }

    select(character) {
        this.bluff.display(character);
    }

}
