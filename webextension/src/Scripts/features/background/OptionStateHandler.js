import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

import Feature from "../Feature.js";
import FeatureEvents from "../FeatureEvents.js";
import FeatureExecutionContext from "../FeatureExecutionContext.js";

const state = {
    options: null
}

/**
 * Option State Handler feature
 */
export default class OptionStateHandler extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Background.Initialize:
            case FeatureEvents.Option.Updated:
                return await this.loadOptionsAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Load options
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async loadOptionsAsync(executionContext) {
        state.options = await ExtensionHelper.getOptionsAsync();
        executionContext.FeatureProvider.options = state.options;
    }
}