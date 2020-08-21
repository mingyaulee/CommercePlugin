import Feature from "../Feature.js";
import FeatureEvents from "../FeatureEvents.js";
import FeatureExecutionContext from "../FeatureExecutionContext.js";
import { LoginToSitecoreTask } from "../automation/SitecoreAutomations.js";
import * as CommerceAutomations from "../automation/CommerceAutomations.js";

/**
 * Commerce Tab State Handler feature
 */
export default class CommerceAutomationsProvider extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Automation.GetAutomationByTabState:
                return await this.getAutomationsByTabStateAsync(executionContext);
            case FeatureEvents.Automation.GetAutomationById:
                return await this.getAutomationsById(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Gets Commerce automation by tab state
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async getAutomationsByTabStateAsync(executionContext) {
        const automations = [];
        if (await CommerceAutomations.IsCommercePageAsync(executionContext)) {
            if (await CommerceAutomations.IsDeliveryPageAsync(executionContext)) {
                automations.push(CommerceAutomations.FillInDeliveryInformation);
            }

            if (await CommerceAutomations.IsBillingPageAsync(executionContext)) {
                automations.push(CommerceAutomations.FillInBillingInformation);
            }

            automations.push(CommerceAutomations.PerformCheckout);
            automations.push(LoginToSitecoreTask);
        }
        return automations;
    }

    /**
     * Gets Commerce automation by id
     * @param {FeatureExecutionContext} executionContext execution context
     */
    getAutomationsById(executionContext) {
        if (executionContext.EventArg.type === CommerceAutomations.AutomationTypeId) {
            return CommerceAutomations[executionContext.EventArg.name];
        }
        return super.OnAsync(executionContext);
    }
}