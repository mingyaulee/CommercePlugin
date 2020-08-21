import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";
import AutomationTask from "../../foundation/modules/AutomationTask.js";

import Feature from "../Feature.js";
import FeatureEvents from "../FeatureEvents.js";
import FeatureExecutionContext from "../FeatureExecutionContext.js";

/**
 * Automation Runner feature
 */
export default class AutomationRunner extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Automation.Run:
                return await this.runAutomationAsync(executionContext);
            case FeatureEvents.Automation.RunInNewTab:
                return await this.runAutomationInNewTabAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Runs an automation task
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async runAutomationAsync(executionContext) {
        /** @type {AutomationTask} */
        let automationTask = executionContext.EventArg.automationTask;
        if (!automationTask && executionContext.EventArg.automationId) {
            const automationType = executionContext.EventArg.automationId.split('.')[0];
            const automationName = executionContext.EventArg.automationId.split('.')[1];
            automationTask = await executionContext.FeatureProvider.RunAsync(FeatureEvents.Automation.GetAutomationById, {
                type: automationType,
                name: automationName
            });
        }
        const logger = executionContext.EventArg.logger;
        return await automationTask.executeAsync(executionContext.ScriptHelper, executionContext.TabId, executionContext.Options, logger);
    }

    /**
     * Runs an automation task in a new tab
     * @param {FeatureExecutionContext} executionContext execution context
     */
    runAutomationInNewTabAsync(executionContext) {
        /** @type {AutomationTask} */
        const automationTask = executionContext.EventArg.automationTask;
        const url = ExtensionHelper.getURL(`Views/automation.html?tabId=${executionContext.TabId}&automationId=${automationTask.id}`);
        return ExtensionHelper.createTabAsync({
            url: url,
            type: "popup",
            width: 400,
            height: 500,
            top: 100
        });
    }
}