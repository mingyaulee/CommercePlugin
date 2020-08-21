import Feature from "../../features/Feature.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";
import CheckboxInput from "./modules/CheckboxInput.js";

/**
 * Boolean Renderer feature
 */
export default class BooleanRenderer extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Options.RenderInput:
                if (executionContext.EventArg.options.type === Boolean) {
                    return await this.createInputAsync(executionContext);
                }
                break;
            case ProjectEvents.Options.GetInput:
                if (executionContext.EventArg.dataset.type === Boolean.name) {
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
        const formCheck = globalThis.document.createElement("div");
        const label = globalThis.document.createElement("label");
        const labelText = globalThis.document.createElement("span");
        const defaultValueText = globalThis.document.createElement("span");
        const input = globalThis.document.createElement("input");

        element.appendChild(inputGroup);
        inputGroup.appendChild(formCheck);
        formCheck.appendChild(label);
        label.appendChild(input);
        label.appendChild(labelText);
        label.appendChild(defaultValueText);

        inputGroup.className = "input-group";
        inputGroup.setAttribute("data-bind", propertyPath);
        inputGroup.dataset.type = Boolean.name;
        formCheck.className = "form-check w-100";
        label.className = "form-check-label";
        labelText.innerText = options.name;
        defaultValueText.innerText = "(default value)";
        defaultValueText.className = "default-value-text";
        input.className = "form-check-input";
        input.type = "checkbox";

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
     * @returns {CheckboxInput}
     */
    getInput(element) {
        return new CheckboxInput(element.querySelector("input"));
    }
}