import Input from "./Input.js";

export default class SymbolInput extends Input {
    /**
     * Creates a new instance of Input
     * @param {HTMLElement} element element
     */
    constructor(element) {
        super(element);
    }

    /**
     * @override
     */
    getValue() {
        return this.element.getAttribute("data-value");
    }

    /**
     * @override
     * @param {String} value value
     */
    setValue(value) {
        /** @type {HTMLElement} */ (this.element).innerText = this.isDefaultValue(value) ? "Default" : value;
        this.element.setAttribute("data-value", value);
    }

    /**
     * @override
     * @param {String} placeholder placeholder
     */
    setPlaceholder(placeholder) {
    }

    /**
     * @override
     * @param {function(Object): void} callback 
     */
    onChange(callback) {
        this.element.addEventListener("symbolChange", callback);
    }

    /**
     * Triggers a change event on the array
     */
    triggerChange() {
        this.element.dispatchEvent(new CustomEvent("symbolChange"));
    }

    isDefaultValue(value) {
        return value === "" || value === "-";
    }
}