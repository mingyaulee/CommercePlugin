import Feature from "../../features/Feature.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";
import Input from "./modules/Input.js";

/**
 * String Renderer feature
 */
export default class StringRenderer extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Options.RenderInput:
                if (executionContext.EventArg.options.type === String) {
                    return await this.createInputAsync(executionContext);
                }
                break;
            case ProjectEvents.Options.GetInput:
                if (executionContext.EventArg.dataset.type === String.name) {
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
        inputGroup.dataset.type = String.name;
        formGroup.className = "form-group w-100";
        label.className = "form-check-label";
        labelText.innerText = options.name;
        defaultValueText.innerText = "(default value)";
        defaultValueText.className = "default-value-text";
        input.className = "form-control";

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
     * @returns {Input}
     */
    getInput(element) {
        return new Input(element.querySelector("input"));
    }
}