import LogHelper from "../foundation/helpers/LogHelper.js";
import TabScriptHelper from "../foundation/helpers/TabScriptHelper.js";

import FeatureProvider from "../features/FeatureProvider.js";
import FeatureExecutionContext from "../features/FeatureExecutionContext.js";

import Initialize from "./automation/Initialize.js";
import AutomationComponent from "./automation/AutomationComponent.js";

/**
 * Popup Script Feature Provider class
 */
export default class AutomationPageFeatureProvider extends FeatureProvider {
    /**
     * Creates a new instance of Popup Script Feature Provider
     */
    constructor() {
        LogHelper.logGroupStart("Feature Registration");
        const features = [];
        new Initialize().RegisterFeature(features);
        new AutomationComponent().RegisterFeature(features);

        super("automation", features);
        LogHelper.logGroupEnd();
    }

    /**
     * @param {String} eventName event name
     * @param {Object} [eventArg] event argument
     */
    async RunAsync(eventName, eventArg) { 
        const executionContext = new FeatureExecutionContext(this.scriptName, eventName, eventArg, this.tabId, this.options);
        executionContext.ScriptHelper = new TabScriptHelper(this.tabId, this.options);
        return super.RunWithContextAsync(executionContext);
    }
}