import LogHelper from "../foundation/helpers/LogHelper.js";

import FeatureExecutionContext from "./FeatureExecutionContext.js";

/**
 * Feature class
 * @class
 */
export default class Feature {
    static EmptyExecutionResult = Symbol();

    /**
     * Registers the current feature
     * @param {Feature[]} features features array
     */
    RegisterFeature(features) {
        if (features.every(feature => feature.constructor !== this.constructor)) {
            features.push(this);
            LogHelper.log(`Registered feature ${this.constructor.name}`);
        }
    }

    /**
     * Event handler in feature. This function is overridden in every inherited class. Return await super.OnAsync(executionContext) when the execution is not handled.
     * @abstract
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise<Object>}
     */
    async OnAsync(executionContext) {
        return Feature.EmptyExecutionResult;
    }
}