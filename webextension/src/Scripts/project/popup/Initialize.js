import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
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
            case FeatureEvents.Background.Initialize:
                return await this.initializeVariablesAsync(executionContext);
            case ProjectEvents.Page.PageLoaded:
                this.attachEventListeners();
                return;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize execution context variables
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async initializeVariablesAsync(executionContext) {
        executionContext.FeatureProvider.tabId = await ExtensionHelper.getActiveTabAsync();
        const tabState = await ExtensionHelper.sendMessageAsync({
            eventName: FeatureEvents.Tab.GetTabState,
            eventArg: executionContext.FeatureProvider.tabId
        });
        return executionContext.FeatureProvider.RunAsync(FeatureEvents.Tab.UpdateTabState, tabState);
    }

    /**
     * Attach on click event listeners to buttons
     */
    attachEventListeners() {
        const element = globalThis.document.getElementById("optionsButton");
        element?.addEventListener("click", ExtensionHelper.goToOptionsPage);
    }
}