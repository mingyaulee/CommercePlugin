import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";
import DataBinder from "./DataBinder.js";
import ArrayRenderer from "./ArrayRenderer.js";
import BooleanRenderer from "./BooleanRenderer.js";
import NumberRenderer from "./NumberRenderer.js";
import ObjectRenderer from "./ObjectRenderer.js";
import StringRenderer from "./StringRenderer.js";
import SymbolRenderer from "./SymbolRenderer.js";

/**
 * Options Component feature
 */
export default class OptionsComponent extends Feature {
    /**
     * @override
     * @param {Feature[]} features features array
     */
    RegisterFeature(features) {
        super.RegisterFeature(features);
        new DataBinder().RegisterFeature(features);
        new ArrayRenderer().RegisterFeature(features);
        new BooleanRenderer().RegisterFeature(features);
        new NumberRenderer().RegisterFeature(features);
        new ObjectRenderer().RegisterFeature(features);
        new StringRenderer().RegisterFeature(features);
        new SymbolRenderer().RegisterFeature(features);
    }

    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Page.PageLoaded:
                return await this.initializeAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize component
     * @param {FeatureExecutionContext} executionContext execution context
     */
    initializeAsync(executionContext) {
        globalThis.document.title = ExtensionHelper.getExtensionName();
        this.saveButton = globalThis.document.getElementById("save");
        this.container = globalThis.document.getElementById("container");
        this.status = globalThis.document.getElementById("status");
        this.featureProvider = executionContext.FeatureProvider;
        this.attachEventListener();
        return this.restoreOptionsAsync();
    }

    /**
     * Attach on click event listener to button
     */
    attachEventListener() {
        this.saveButton.addEventListener("click", this.saveOptions.bind(this));
    }

    /**
     * Retrieves and render the current stored options
     */
    async restoreOptionsAsync() {
        this.featureProvider.options = await ExtensionHelper.getOptionsAsync();
        this.featureProvider.contextItems["trackedOptions"] = { value: {} };

        while (this.container.children.length) {
            this.container.children[0].remove();
        }

        await this.featureProvider.RunAsync(
            ProjectEvents.Options.RenderInput,
            {
                element: this.container,
                options: this.featureProvider.options,
                propertyPath: null,
                bindInputChange: true
            }
        );
    }

    /**
     * Saves the tracked options into storage
     */
    saveOptions() {
        const trackedOptions = this.featureProvider.contextItems["trackedOptions"];
        globalThis.browser.storage.sync.set(trackedOptions)
            .then(() => {
                this.status.classList.remove("d-none");
                globalThis.setTimeout(() => {
                    this.status.classList.add("d-none");
                }, 750);
                ExtensionHelper.sendMessageAsync({
                    eventName: FeatureEvents.Option.Updated
                });
                this.restoreOptionsAsync();
            });
    }
}