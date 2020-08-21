import Feature from "../../features/Feature.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";
import SymbolInput from "./modules/SymbolInput.js";
import ArrayInput from "./modules/ArrayInput.js";

/**
 * Symbol Renderer feature
 */
export default class SymbolRenderer extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Page.PageLoaded:
                return this.initialize(executionContext);
            case ProjectEvents.Options.RenderInput:
                if (executionContext.EventArg.options.type === Symbol) {
                    return await this.createInputAsync(executionContext);
                }
                break;
            case ProjectEvents.Options.GetInput:
                if (executionContext.EventArg.dataset.type === Symbol.name) {
                    return this.getInput(executionContext.EventArg);
                }
                break;
            case ProjectEvents.Options.InputChange:
                if (executionContext.EventArg.element.dataset.type === Array.name) {
                    this.handleInputChange(executionContext);
                    return;
                }
                break;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize
     * @param {FeatureExecutionContext} executionContext execution context
     */
    initialize(executionContext) {
        this.featureProvider = executionContext.FeatureProvider;
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
        const dropdownGroup = globalThis.document.createElement("div");
        const dropdownToggle = globalThis.document.createElement("button");
        const dropdownMenu = globalThis.document.createElement("div");

        element.appendChild(inputGroup);
        inputGroup.appendChild(formGroup);
        formGroup.appendChild(label);
        formGroup.appendChild(dropdownGroup);
        label.appendChild(labelText);
        label.appendChild(defaultValueText);
        dropdownGroup.appendChild(dropdownToggle);
        dropdownGroup.appendChild(dropdownMenu);

        inputGroup.className = "input-group";
        inputGroup.setAttribute("data-bind", propertyPath);
        inputGroup.setAttribute("data-watch-property-path", options.datasource);
        inputGroup.dataset.type = Symbol.name;
        formGroup.className = "form-group w-100";
        label.className = "form-check-label";
        labelText.innerText = options.name;
        defaultValueText.innerText = "(default value)";
        defaultValueText.className = "default-value-text";
        dropdownGroup.className = "dropdown";
        dropdownToggle.className = "btn btn-primary dropdown-toggle";
        dropdownToggle.type = "button";
        dropdownMenu.className = "dropdown-menu";

        const input = this.getInput(inputGroup);
        await executionContext.FeatureProvider.RunAsync(
            ProjectEvents.Options.BindInput,
            {
                name: options.name,
                element: inputGroup,
                input: input,
                bindInputChange: bindInputChange
            }
        );

        await this.bindDropdownOnClickAsync(dropdownToggle, dropdownMenu, options.datasource, input);

        return inputGroup;
    }

    /**
     * Binds to click event of dropdown button
     * @param {HTMLButtonElement} dropdownToggle dropdown toggle
     * @param {HTMLDivElement} dropdownMenu dropdown menu
     * @param {String} datasource datasource
     * @param {SymbolInput} input
     */
    async bindDropdownOnClickAsync(dropdownToggle, dropdownMenu, datasource, input) {
        dropdownToggle.addEventListener("click", async (event) => {
            event.preventDefault();

            if (dropdownMenu.classList.contains("show")) {
                dropdownMenu.classList.remove("show");
                return;
            }

            while (dropdownMenu.children.length) {
                dropdownMenu.children[0].remove();
            }
            dropdownMenu.classList.add("show");
            const datasourceElement = globalThis.document.querySelector(`[data-bind='${datasource}']`);
            /** @type {ArrayInput} */
            const datasourceInput = await this.featureProvider.RunAsync(ProjectEvents.Options.GetInput, datasourceElement);
            const datasourceValues = datasourceInput.getValue();
            /** @type {String[]} */
            const dropdownValues = ["-"].concat(datasourceValues.map(datasourceValue => datasourceValue.name));

            dropdownValues.forEach(dropdownValue => {
                const dropdownMenuItem = globalThis.document.createElement("a");
                dropdownMenu.appendChild(dropdownMenuItem);
                dropdownMenuItem.innerText = input.isDefaultValue(dropdownValue) ? "Default" : dropdownValue;
                dropdownMenuItem.href = "#";
                dropdownMenuItem.className = "dropdown-item";
                dropdownMenuItem.setAttribute("data-value", dropdownValue);
            });
        });

        dropdownMenu.addEventListener("click", (event) => {
            event.preventDefault();

            const dropdownMenuItem = /** @type {HTMLElement} */ (event.target);
            const dropdownValue = dropdownMenuItem.getAttribute("data-value");
            input.setValue(dropdownValue);
            input.triggerChange();

            dropdownMenu.classList.remove("show");
        }, true);
    }

    /**
     * Gets the input from the element
     * @param {Element} inputGroup input group
     * @returns {SymbolInput}
     */
    getInput(inputGroup) {
        return new SymbolInput(inputGroup.querySelector("button"));
    }

    /**
     * Handles input change
     * @param {FeatureExecutionContext} executionContext execution context
     */
    handleInputChange(executionContext) {
        const { propertyPath, currentValue } = executionContext.EventArg;
        globalThis.document.querySelectorAll(`[data-watch-property-path='${propertyPath}']`).forEach(inputGroup => {
            const input = this.getInput(inputGroup);
            const currentInputValue = input.getValue();
            if (!input.isDefaultValue(currentInputValue) && !currentValue.find(arrayItem => arrayItem.name === currentInputValue)) {
                input.setValue("-");
                input.triggerChange();
            }
        });
    }
}