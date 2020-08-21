import LogHelper from "../foundation/helpers/LogHelper.js";
import ContentScriptHelper from "../foundation/helpers/ContentScriptHelper.js";

import FeatureProvider from "../features/FeatureProvider.js";
import FeatureExecutionContext from "../features/FeatureExecutionContext.js";
import PageEventsHandler from "../features/pageEvent/PageEventsHandler.js";

import Initialize from "./contentScript/Initialize.js";
import PageEventListener from "./contentScript/PageEventListener.js";
import AutomationsComponent from "./contentScript/AutomationsComponent.js";

/**
 * Content Script Feature Provider class
 */
export default class ContentScriptFeatureProvider extends FeatureProvider {
    /**
     * Creates a new instance of Content Script Feature Provider
     */
    constructor() {
        LogHelper.logGroupStart("Feature Registration");
        const features = [];
        new Initialize().RegisterFeature(features);
        new PageEventListener().RegisterFeature(features);
        new AutomationsComponent().RegisterFeature(features);

        new PageEventsHandler().RegisterFeature(features);

        super("contentScript", features);
        LogHelper.logGroupEnd();
    }

    /**
     * @override
     * @param {String} eventName event name
     * @param {Object} [eventArg] event argument
     */
    async RunAsync(eventName, eventArg) {
        const executionContext = new FeatureExecutionContext(this.scriptName, eventName, eventArg, this.tabId, this.options);
        executionContext.ScriptHelper = new ContentScriptHelper(this.options);
        return super.RunWithContextAsync(executionContext);
    }
}