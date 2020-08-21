import Feature from "../Feature.js";
import SitecoreAutomationsProvider from "./SitecoreAutomationsProvider.js";
import CommerceAutomationsProvider from "./CommerceAutomationsProvider.js";

/**
 * Automation Providers feature
 */
export default class AutomationProviders extends Feature {
    /**
     * @override
     * @param {Feature[]} features features array
     */
    RegisterFeature(features) {
        super.RegisterFeature(features);
        new SitecoreAutomationsProvider().RegisterFeature(features);
        new CommerceAutomationsProvider().RegisterFeature(features);
    }
}