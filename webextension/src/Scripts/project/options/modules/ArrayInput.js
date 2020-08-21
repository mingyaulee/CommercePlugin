import Input from "./Input.js";
import OptionNode from "../../../foundation/modules/OptionNode.js";

export default class ArrayInput extends Input {
    /**
     * Creates a new instance of Input
     * @param {HTMLElement} element element
     * @param {Element[]} inputElements input element
     * @param {Input[]} inputs inputs
     */
    constructor(element, inputElements, inputs) {
        super(element);
        this.inputElements = inputElements;
        this.inputs = inputs;
    }

    /**
     * @override
     */
    getValue() {
        const array = [];
        for (let i = 0; i < this.inputs.length; i++) {
            const relativePropertyPath = this.inputElements[i].getAttribute("data-array-subpath");
            const objectName = this.inputElements[i].getAttribute("data-array-property-name");

            let arrayItem = array.find(item => item.name === objectName);
            if (!arrayItem) {
                arrayItem = {
                    name: objectName,
                    value: relativePropertyPath ? {} : null
                };
                array.push(arrayItem);
            }

            if (relativePropertyPath) {
                const optionNode = OptionNode.GetOptionNodeByPropertyPath(arrayItem.value, relativePropertyPath, true);
                optionNode.node[optionNode.key].value = this.inputs[i].getValue();
            } else {
                arrayItem.value = this.inputs[i].getValue();
            }
        }
        return array;
    }

    /**
     * @override
     * @param {Boolean} value value
     */
    setValue(value) {
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
        this.listenToInputs(this.inputs);
        this.element.addEventListener("arrayChange", callback);
    }

    /**
     * Listens to the change of the inputs
     * @param {Input[]} inputs inputs
     */
    listenToInputs(inputs) {
        inputs.forEach(input => input.onChange(this.triggerChange.bind(this)));
    }

    /**
     * Triggers a change event on the array
     */
    triggerChange() {
        this.element.dispatchEvent(new CustomEvent("arrayChange"));
    }

    /**
     * @override
     * @param {Object} value1 value 1
     * @param {Object} value2 value 2
     */
    areEqual(value1, value2) {
        if (typeof(value1) === "object" && typeof(value2) === "object") {
            const uniqueKeys = Object.keys(value1);
            for (const key of Object.keys(value2)) {
                if (uniqueKeys.includes(key)) {
                    continue;
                }
                uniqueKeys.push(key);
            }

            return uniqueKeys.every(key => this.areEqual(value1[key], value2[key]));
        }
        return value1 === value2;
    }
}