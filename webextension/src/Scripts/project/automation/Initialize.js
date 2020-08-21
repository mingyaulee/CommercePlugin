import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";
import QueryString from "../../foundation/modules/QueryString.js";

import Feature from "../../features/Feature.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";

/**
 * Initialize feature
 */
export default class Initialize extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Page.Initialize:
                return await this.initializeVariablesAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize execution context variables
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async initializeVariablesAsync(executionContext) {
        executionContext.FeatureProvider.options = await ExtensionHelper.getOptionsAsync();
        if (globalThis.window.location.search.length > 1) {
            const query = QueryString.Parse(globalThis.window.location.search.substring(1));
            executionContext.FeatureProvider.tabId = parseInt(query["tabId"].toString());
            executionContext.ContextItems["automationId"] = query["automationId"].toString();
        }
    }
}