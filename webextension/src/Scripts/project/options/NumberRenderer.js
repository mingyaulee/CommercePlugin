import Feature from "../../features/Feature.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";
import NumericInput from "./modules/NumericInput.js";

/**
 * Number Renderer feature
 */
export default class NumberRenderer extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Options.RenderInput:
                if (executionContext.EventArg.options.type === Number) {
                    return await this.createInputAsync(executionContext);
                }
                break;
            case ProjectEvents.Options.GetInput:
                if (executionContext.EventArg.dataset.type === Number.name) {
                    return this.getInput(executionContext.EventArg);
                }
                break;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Creates the input
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise<HTMLDivElement>}
     */
    async createInputAsync(executionContext) {
        const { element, options, propertyPath, bindInputChange } = executionContext.EventArg;
        const inputGroup = globalThis.document.createElement("div");
        const formGroup = globalThis.document.createElement("div");
        const label = globalThis.document.createElement("label");
        const labelText = globalThis.document.createElement("span");
        const defaultValueText = globalThis.document.createElement("span");
        const input = globalThis.document.createElement("input");

        element.appendChild(inputGroup);
        inputGroup.appendChild(formGroup);
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        label.appendChild(labelText);
        label.appendChild(defaultValueText);

        inputGroup.className = "input-group";
        inputGroup.setAttribute("data-bind", propertyPath);
        inputGroup.dataset.type = Number.name;
        formGroup.className = "form-group w-100";
        label.className = "form-check-label";
        labelText.innerText = options.name;
        defaultValueText.innerText = "(default value)";
        defaultValueText.className = "default-value-text";
        input.className = "form-control";
        input.type = "number";
        if (options.min) {
            input.min = options.min;
        }
        if (options.max) {
            input.max = options.max;
        }
        if (options.step) {
            input.step = options.step;
        }

        await executionContext.FeatureProvider.RunAsync(
            ProjectEvents.Options.BindInput,
            {
                name: options.name,
                element: inputGroup,
                input: this.getInput(inputGroup),
                bindInputChange: bindInputChange
            }
        );

        return inputGroup;
    }

    /**
     * Gets the input from the element
     * @param {HTMLElement} element element
     * @returns {NumericInput}
     */
    getInput(element) {
        return new NumericInput(element.querySelector("input"));
    }
}