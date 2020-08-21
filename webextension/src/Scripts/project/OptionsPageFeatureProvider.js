import LogHelper from "../foundation/helpers/LogHelper.js";

import FeatureProvider from "../features/FeatureProvider.js";
import FeatureExecutionContext from "../features/FeatureExecutionContext.js";

import OptionsComponent from "./options/OptionsComponent.js";

/**
 * Options Page Feature Provider class
 */
export default class OptionsPageFeatureProvider extends FeatureProvider {
    /**
     * Creates a new instance of Options Page Feature Provider
     */
    constructor() {
        LogHelper.logGroupStart("Feature Registration");
        const features = [];
        new OptionsComponent().RegisterFeature(features);

        super("options", features);
        LogHelper.logGroupEnd();
    }

    /**
     * @param {String} eventName event name
     * @param {Object} [eventArg] event argument
     */
    async RunAsync(eventName, eventArg) { 
        const executionContext = new FeatureExecutionContext(this.scriptName, eventName, eventArg, this.tabId, this.options);
        return super.RunWithContextAsync(executionContext);
    }
}