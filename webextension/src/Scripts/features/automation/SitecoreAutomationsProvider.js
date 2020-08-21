import Feature from "../Feature.js";
import FeatureEvents from "../FeatureEvents.js";
import FeatureExecutionContext from "../FeatureExecutionContext.js";
import * as SitecoreAutomations from "../automation/SitecoreAutomations.js";

/**
 * Sitecore Automations Provider feature
 */
export default class SitecoreAutomationsProvider extends Feature {
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
     * Gets Sitecore automation by tab state
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async getAutomationsByTabStateAsync(executionContext) {
        const automations = [];
        if (await SitecoreAutomations.IsSitecoreApplicationPageAsync(executionContext)) {
            automations.push(SitecoreAutomations.LaunchInViewModeTask);

            if (!(await SitecoreAutomations.IsContentEditorPageAsync(executionContext))) {
                automations.push(SitecoreAutomations.LaunchContentEditorTask);
            }

            automations.push(SitecoreAutomations.SwitchOffResourceOptimiserTask);
            automations.push(SitecoreAutomations.DebugTask);
        }

        if (await SitecoreAutomations.IsExperienceEditorPageAsync(executionContext)) {
            automations.push(SitecoreAutomations.LaunchInViewModeTask);
        }

        if (await SitecoreAutomations.IsIdentityServerPageAsync(executionContext)) {
            automations.push(SitecoreAutomations.LoginToSitecoreTask);
            automations.push(SitecoreAutomations.LaunchInViewModeTask);
        }
        return automations;
    }

    /**
     * Gets Sitecore automation by id
     * @param {FeatureExecutionContext} executionContext execution context
     */
    getAutomationsById(executionContext) {
        if (executionContext.EventArg.type === SitecoreAutomations.AutomationTypeId) {
            return SitecoreAutomations[executionContext.EventArg.name];
        }
        return super.OnAsync(executionContext);
    }
}