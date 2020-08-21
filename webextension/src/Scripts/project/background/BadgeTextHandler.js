import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

/**
 * Badge Text Handler feature
 */
export default class BadgeTextHandler extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Background.Initialize:
                this.initialize();
                return;
            case FeatureEvents.PageEvents.CurrentEventsUpdated:
                this.currentEventsUpdated(executionContext);
                return;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize feature
     */
    initialize() {
        ExtensionHelper.setBadgeText("");
    }

    /**
     * Trigger current events updated event
     * @param {FeatureExecutionContext} executionContext execution context
     */
    currentEventsUpdated(executionContext) {
        const currentEventsLength = executionContext.EventArg.length;
        ExtensionHelper.setBadgeText(currentEventsLength > 0 ? currentEventsLength.toString() : "");
    }
}