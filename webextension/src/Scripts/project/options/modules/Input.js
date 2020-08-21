export default class Input {
    /** @type {Element} */
    element;

    /**
     * Creates a new instance of Input
     * @param {HTMLElement} element element
     */
    constructor(element) {
        this.element = element;
    }

    /**
     * Gets the value of the input
     * @returns {Object}
     */
    getValue() {
        return /** @type {HTMLInputElement} */ (this.element).value;
    }

    /**
     * Sets the value of the input
     * @param {Object} value value
     */
    setValue(value) {
        /** @type {HTMLInputElement} */ (this.element).value = value;
    }

    /**
     * Sets the placeholder of the input
     * @param {String} placeholder placeholder
     */
    setPlaceholder(placeholder) {
        /** @type {HTMLInputElement} */ (this.element).placeholder = placeholder;
    }

    /**
     * Add on change listener to the input
     * @param {function(Object): void} callback callback function
     */
    onChange(callback) {
        this.element.addEventListener("input", callback);
    }

    /**
     * Compares if the two input values are equal
     * @param {Object} value1 value 1
     * @param {Object} value2 value 2
     * @returns {Boolean}
     */
    areEqual(value1, value2) {
        return value1 === value2;
    }
}