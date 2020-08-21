import Feature from "../../features/Feature.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";

/**
 * Object Renderer feature
 */
export default class ObjectRenderer extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Options.RenderInput:
                if (executionContext.EventArg.options.type === Object) {
                    return await this.createInputAsync(executionContext);
                }
                break;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Creates the input
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise<HTMLDivElement[]>}
     */
    async createInputAsync(executionContext) {
        const { element, options, propertyPath, bindInputChange } = executionContext.EventArg;
        let sectionBody = element;

        if (propertyPath !== null) {
            const sectionGroup = globalThis.document.createElement("div");
            const sectionHeader = globalThis.document.createElement("div");
            sectionBody = globalThis.document.createElement("div");

            element.appendChild(sectionGroup);
            sectionGroup.appendChild(sectionHeader);
            sectionGroup.appendChild(sectionBody);
            sectionHeader.innerText = options.name;

            if (propertyPath.indexOf("/") === -1) {
                sectionGroup.className = "card mb-4";
                sectionHeader.className = "card-header font-weight-bold";
                sectionBody.className = "card-body";
            } else {
                sectionGroup.className = "option-section-group";
                sectionHeader.className = "option-section-header font-weight-bold pb-1";
                sectionBody.className = "option-section-body px-3";
            }
        }

        const inputGroups = [];
        for (const property of Object.keys(options.value)) {
            const inputGroup = await executionContext.FeatureProvider.RunAsync(
                ProjectEvents.Options.RenderInput,
                {
                    element: sectionBody,
                    options: options.value[property],
                    propertyPath: (propertyPath ? propertyPath + "/" : "") + property,
                    bindInputChange: bindInputChange
                }
            );
            inputGroups.push(inputGroup);
        }

        return inputGroups;
    }
}