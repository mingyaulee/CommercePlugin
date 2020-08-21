import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

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
            case ProjectEvents.Page.PageLoaded:
                return await this.initializePageVariablesAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize execution context variables
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async initializeVariablesAsync(executionContext) {
        executionContext.FeatureProvider.tabId = await ExtensionHelper.sendMessageAsync({ scope: "sender", command: "tab.id" });
        executionContext.FeatureProvider.options = await ExtensionHelper.getOptionsAsync();
    }

    /**
     * Initialize page variables
     * @param {FeatureExecutionContext} executionContext execution context
     */
    initializePageVariablesAsync(executionContext) {
        return executionContext.ScriptHelper.executeScriptAsync(`
            window.top.windowUnloading = false;
            window.top.addEventListener("beforeunload", () => window.top.windowUnloading = true);
        `);
    }
}