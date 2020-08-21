import Option from "../../foundation/modules/Option.js";

import Feature from "../../features/Feature.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";
import ArrayInput from "./modules/ArrayInput.js";

/**
 * Array Renderer feature
 */
export default class ArrayRenderer extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Page.PageLoaded:
                return this.initialize(executionContext);
            case ProjectEvents.Options.RenderInput:
                if (executionContext.EventArg.options.type === Array) {
                    return await this.createInputAsync(executionContext);
                }
                break;
            case ProjectEvents.Options.GetInput:
                if (executionContext.EventArg.dataset.type === Array.name) {
                    return await this.getInputAsync(executionContext.EventArg);
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

        const sectionGroup = globalThis.document.createElement("div");
        const sectionHeader = globalThis.document.createElement("div");
        const sectionBody = globalThis.document.createElement("div");
        const labelText = globalThis.document.createElement("span");
        const defaultValueText = globalThis.document.createElement("span");
        const addForm = globalThis.document.createElement("form");
        const addButton = globalThis.document.createElement("button");
        const addTextbox = globalThis.document.createElement("input");
        const arrayItemContainer = globalThis.document.createElement("ul");

        element.appendChild(sectionGroup);
        sectionGroup.appendChild(sectionHeader);
        sectionGroup.appendChild(sectionBody);
        sectionHeader.appendChild(labelText);
        sectionHeader.appendChild(defaultValueText);
        sectionHeader.appendChild(addForm);
        addForm.appendChild(addButton);
        addForm.appendChild(addTextbox);
        sectionBody.appendChild(arrayItemContainer);

        sectionGroup.className = "option-section-group option-array-group";
        sectionGroup.setAttribute("data-bind", propertyPath);
        sectionGroup.dataset.type = Array.name;
        sectionHeader.className = "option-section-header font-weight-bold pb-1";
        labelText.innerText = options.name;
        defaultValueText.innerText = "(default value)";
        defaultValueText.className = "default-value-text";
        addForm.className = "d-inline form-inline";
        addButton.innerText = "+";
        addButton.className = "btn btn-success btn-sm ml-2 mr-1 option-array-item-add";
        addButton.type = "submit";
        addTextbox.className = "form-control form-control-sm array-add-textbox";
        sectionBody.className = "option-section-body px-3";
        arrayItemContainer.className = "list-group list-group-flush pb-3";

        const optionValues = Option.Parse(options).value;
        for (const propertyName of Object.keys(optionValues)) {
            await this.createArrayItemAsync(arrayItemContainer, sectionGroup, propertyPath, propertyName, optionValues[propertyName]);
        }

        this.bindAddButtonOnSubmit(addForm, sectionGroup, arrayItemContainer, addTextbox, propertyPath, options.schema);

        if (bindInputChange) {
            await this.bindInputChangeAsync(sectionGroup);
        }

        return sectionGroup;
    }

    /**
     * Create the array item
     * @param {HTMLElement} arrayItemContainer section body
     * @param {HTMLDivElement} sectionGroup section group
     * @param {String} propertyPath property path
     * @param {String} propertyName property name
     * @param {Object} propertyOption property option
     * @returns {Promise<HTMLDivElement[]>}
     */
    async createArrayItemAsync(arrayItemContainer, sectionGroup, propertyPath, propertyName, propertyOption) {
        const arrayItem = globalThis.document.createElement("li");
        const deleteButton = globalThis.document.createElement("button");

        arrayItemContainer.appendChild(arrayItem);
        arrayItem.appendChild(deleteButton);

        arrayItem.className = "list-group-item position-relative option-array-item";
        deleteButton.innerText = "×";
        deleteButton.className = "btn btn-danger btn-sm position-absolute option-array-item-delete";
        deleteButton.type = "button";

        const basePropertyPath = (propertyPath ? propertyPath + "/" : "") + propertyName;
        const inputGroup = await this.featureProvider.RunAsync(
            ProjectEvents.Options.RenderInput,
            {
                element: arrayItem,
                options: propertyOption,
                propertyPath: basePropertyPath,
                bindInputChange: false
            }
        );
        const inputGroups = [inputGroup].flat();
        inputGroups.forEach(inputGroup => {
            inputGroup.setAttribute("data-array-path", propertyPath);
            inputGroup.setAttribute("data-array-property-name", propertyName);
            const fullPropertyPath = inputGroup.getAttribute("data-bind");
            const relativePropertySubpath = fullPropertyPath.substring(basePropertyPath.length + 1);
            inputGroup.setAttribute("data-array-subpath", relativePropertySubpath);
        });

        this.bindDeleteButtonOnClick(deleteButton, sectionGroup, arrayItem);

        return inputGroups;
    }

    /**
     * Binds to the submit event of the add form
     * @param {HTMLFormElement} addForm add form
     * @param {HTMLElement} arrayItemContainer container
     * @param {HTMLDivElement} sectionGroup section group
     * @param {HTMLInputElement} addTextbox add textbox
     * @param {String} propertyPath property path
     * @param {Object} schema schema
     */
    bindAddButtonOnSubmit(addForm, sectionGroup, arrayItemContainer, addTextbox, propertyPath, schema) {
        addForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            addTextbox.classList.remove("is-invalid");

            const showTextBoxClass = "show-array-add-textbox";
            if (!sectionGroup.classList.contains(showTextBoxClass)) {
                sectionGroup.classList.add(showTextBoxClass);
                addTextbox.focus();
                return;
            }

            const propertyName = addTextbox.value;
            if (!propertyName) {
                sectionGroup.classList.remove(showTextBoxClass);
                return;
            }

            const input = await this.getInputAsync(sectionGroup);
            const existingElement = input.inputElements.find(inputElement => inputElement.getAttribute("data-array-property-name") === propertyName);
            if (existingElement || propertyName === "-") {
                addTextbox.classList.add("is-invalid");
                return;
            }

            sectionGroup.classList.remove(showTextBoxClass);
            addTextbox.value = "";
            const inputGroups = await this.createArrayItemAsync(arrayItemContainer, sectionGroup, propertyPath, propertyName, {
                ...schema,
                name: propertyName
            });
            const inputs = [];
            for (const inputGroup of inputGroups) {
                const input = await this.featureProvider.RunAsync(ProjectEvents.Options.GetInput, inputGroup);
                inputs.push(input);
            }
            input.listenToInputs(inputs);
            input.triggerChange();
        });
    }

    /**
     * Binds to the click event of the delete button
     * @param {HTMLButtonElement} deletebutton add button
     * @param {HTMLDivElement} sectionGroup section group
     * @param {HTMLElement} arrayItem array item
     */
    bindDeleteButtonOnClick(deletebutton, sectionGroup, arrayItem) {
        deletebutton.addEventListener("click", async (event) => {
            event.preventDefault();

            arrayItem.remove();
            const input = await this.getInputAsync(sectionGroup);
            input.triggerChange();
        })
    }

    /**
     * Binds input on change
     * @param {HTMLDivElement} sectionGroup input groups
     */
    async bindInputChangeAsync(sectionGroup) {
        await this.featureProvider.RunAsync(
            ProjectEvents.Options.BindInput,
            {
                name: "",
                element: sectionGroup,
                input: await this.getInputAsync(sectionGroup),
                bindInputChange: true
            }
        );
    }

    /**
     * Gets the input from the element
     * @param {HTMLDivElement} sectionGroup section group
     * @returns {Promise<ArrayInput>}
     */
    async getInputAsync(sectionGroup) {
        const propertyPath = sectionGroup.getAttribute("data-bind");
        const inputGroups = sectionGroup.querySelectorAll(`[data-array-path='${propertyPath}']`);
        const inputs = [];
        for (const inputGroup of inputGroups) {
            const input = await this.featureProvider.RunAsync(ProjectEvents.Options.GetInput, inputGroup);
            inputs.push(input);
        }
        return new ArrayInput(sectionGroup, [...inputGroups], inputs);
    }
}