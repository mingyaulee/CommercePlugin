import StateHandler from "../../foundation/modules/StateHandler.js";

import Feature from "../Feature.js";
import FeatureEvents from "../FeatureEvents.js";
import FeatureExecutionContext from "../FeatureExecutionContext.js";

const TabState = new StateHandler({});

/**
 * Tab State Handler feature
 */
export default class TabStateHandler extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Tab.TabRemoved:
                this.onTabRemoved(executionContext);
                return;
            case FeatureEvents.Tab.GetTabState:
                return this.getTabState(executionContext);
            case FeatureEvents.Tab.UpdateTabState:
                this.updateTabState(executionContext);
                return;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * On tab removed handler
     * @param {FeatureExecutionContext} executionContext execution context
     */
    onTabRemoved(executionContext) {
        TabState.remove(executionContext.EventArg || executionContext.TabId);
    }

    /**
     * Get tab state
     * @param {FeatureExecutionContext} executionContext execution context
     */
    getTabState(executionContext) {
        return TabState.get(executionContext.EventArg || executionContext.TabId);
    }

    /**
     * Update tab state
     * @param {FeatureExecutionContext} executionContext execution context
     */
    updateTabState(executionContext) {
        TabState.update(executionContext.EventArg);
    }
}