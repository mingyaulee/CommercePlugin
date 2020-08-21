import Input from "./Input.js";

export default class CheckboxInput extends Input {
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
        return /** @type {HTMLInputElement} */ (this.element).checked;
    }

    /**
     * @override
     * @param {Boolean} value value
     */
    setValue(value) {
        /** @type {HTMLInputElement} */ (this.element).checked = !!value;
    }

    /**
     * @override
     * @param {String} placeholder placeholder
     */
    setPlaceholder(placeholder) {
    }
}