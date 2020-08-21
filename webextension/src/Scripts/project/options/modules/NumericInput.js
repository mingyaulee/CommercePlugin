import Input from "./Input.js";

export default class NumericInput extends Input {
    /**
     * Creates a new instance of Input
     * @param {HTMLInputElement} element element
     */
    constructor(element) {
        super(element);
    }

    /**
     * @override
     */
    getValue() {
        return /** @type {HTMLInputElement} */ (this.element).value ? Number(/** @type {HTMLInputElement} */ (this.element).value) : "";
    }
}