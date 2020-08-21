import DefaultOption from "../../foundation/DefaultOption.js";
import LogHelper from "../../foundation/helpers/LogHelper.js";
import OptionNode from "../../foundation/modules/OptionNode.js";

import Feature from "../../features/Feature.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";
import Input from "./modules/Input.js";

/**
 * Data Binder feature
 */
export default class DataBinder extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Page.PageLoaded:
                this.initialize(executionContext);
                return;
            case ProjectEvents.Options.BindInput:
                return await this.bindElementDataAsync(executionContext);
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
     * Binds the input element
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise}
     */
    async bindElementDataAsync(executionContext) {
        const { name, element, bindInputChange } = executionContext.EventArg;
        /** @type {Input} */
        const input = executionContext.EventArg.input;
        const propertyPath = element.getAttribute("data-bind");
        const currentOptionValue = this.getOptionValue(executionContext.Options, propertyPath);
        const defaultOptionValue = this.getOptionValue(DefaultOption, propertyPath);
        if (!input.areEqual(currentOptionValue, defaultOptionValue)) {
            const trackedOptions = this.featureProvider.contextItems["trackedOptions"];
            this.setOptionValue(trackedOptions, propertyPath, currentOptionValue);
        } else {
            element.classList.add("default-value");
        }

        input.setValue(currentOptionValue);
        let placeholderValue = name || "";
        if (defaultOptionValue) {
            placeholderValue += ` (default: ${defaultOptionValue})`;
        }
        input.setPlaceholder(placeholderValue);

        if (bindInputChange) {
            input.onChange(this.updateDataAsync.bind(this));
        }
    }

    /**
     * Updates the tracked options based on input change
     * @param {InputEvent} event input event
     */
    async updateDataAsync(event) {
        const trackedOptions = this.featureProvider.contextItems["trackedOptions"];
        const element = this.getOptionElementFromInputElement(/** @type {HTMLElement} */ (event.target));
        const propertyPath = element.getAttribute("data-bind");
        const input = await this.getInputFromOptionElementAsync(element);
        const currentOptionValue = input.getValue();
        const storeOptionValue = this.getOptionValue(this.featureProvider.options, propertyPath);
        const defaultOptionValue = this.getOptionValue(DefaultOption, propertyPath);

        if (input.areEqual(currentOptionValue, storeOptionValue) || (currentOptionValue === "" && input.areEqual(storeOptionValue, defaultOptionValue))) {
            element.classList.remove("modified-value");
        } else {
            element.classList.add("modified-value");
        }

        if (!input.areEqual(currentOptionValue, defaultOptionValue) && currentOptionValue !== "") {
            element.classList.remove("default-value");
            this.setOptionValue(trackedOptions, propertyPath, currentOptionValue);
        } else {
            element.classList.add("default-value");
            OptionNode.RemoveOptionNodeByPropertyPath(trackedOptions.value, propertyPath);
        }
        LogHelper.log(JSON.stringify(trackedOptions));

        this.featureProvider.RunAsync(ProjectEvents.Options.InputChange, {
            propertyPath: propertyPath,
            input: input,
            element: element,
            currentValue: currentOptionValue,
            storeValue: storeOptionValue,
            defaultValue: defaultOptionValue
        })
    }

    /**
     * Gets the option element with data attribute from the input element
     * @param {HTMLElement} element element
     * @returns {HTMLElement}
     */
    getOptionElementFromInputElement(element) {
        while (!element.getAttribute("data-bind") || element.getAttribute("data-array-path")) {
            element = element.parentElement;
        }
        return element;
    }

    /**
     * Gets the input object from the option element
     * @param {HTMLElement} element element
     * @returns {Promise<Input>}
     */
    async getInputFromOptionElementAsync(element) {
        return await this.featureProvider.RunAsync(ProjectEvents.Options.GetInput, element);
    }

    /**
     * Gets the option value by property path
     * @param {Object} options options
     * @param {String} propertyPath property path
     */
    getOptionValue(options, propertyPath) {
        return OptionNode.GetOptionNodeByPropertyPath(options.value, propertyPath).value;
    }

    /**
     * Sets the option value by property path
     * @param {Object} options options
     * @param {String} propertyPath property path
     * @param {Object} value value
     */
    setOptionValue(options, propertyPath, value) {
        const optionNode = OptionNode.GetOptionNodeByPropertyPath(options.value, propertyPath, true);
        optionNode.node[optionNode.key].value = value;
    }
}