import LogHelper from "../../foundation/helpers/LogHelper.js";
import PageEvent from "../../foundation/modules/PageEvent.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";
import TfsPageEventListener from "../tfs/TfsPageEventListener.js";
import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

export const state = {
    focused: false,
    listeningToEvents: false,
    listeningToProgress: false,
    checkEventsTimeout: 1000,
    checkProgressTimeout: 5000
};

/**
 * Page Event Listener feature
 */
export default class PageEventListener extends Feature {
    /**
    * @override
    * @param {Feature[]} features features array
    */
    RegisterFeature(features) {
        super.RegisterFeature(features);
        new TfsPageEventListener().RegisterFeature(features);
    }

    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Page.PageLoaded:
                this.featureProvider = executionContext.FeatureProvider;
                return await this.initializePageListenersAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * On page load event
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async initializePageListenersAsync(executionContext) {
        const initializeListenersArg = {};
        await executionContext.FeatureProvider.RunAsync(FeatureEvents.PageEvents.InitializeListeners, initializeListenersArg);
        if (initializeListenersArg.listenToEvents) {
            LogHelper.log("Listening to page events");
            this.listenToEvents();
            globalThis.setTimeout(this.listenToEvents.bind(this), 5000);
            globalThis.window.addEventListener("focus", this.listenToEvents.bind(this));
        }
    }

    /**
     * Start listening to page events
     */
    listenToEvents() {
        if (state.listeningToEvents === true) {
            return;
        }
        state.listeningToEvents = true;
        this.checkForEventsAsync();
    }

    /**
     * Run CheckEvents
     */
    async checkForEventsAsync() {
        state.focused = !globalThis.document.hidden;

        /** @type {Array<PageEvent[]>} */
        const newEvents = await this.featureProvider.RunAsync(FeatureEvents.PageEvents.CheckEvents);
        /** @type {PageEvent[]} */
        let currentEvents = await this.featureProvider.RunAsync(FeatureEvents.PageEvents.GetEvents)
        newEvents.flat().forEach(newEvent => {
            if (newEvent !== null && currentEvents.every(currentEvent => !currentEvent.equals(newEvent))) {
                newEvent.tabId = this.featureProvider.tabId;
                this.featureProvider.RunAsync(FeatureEvents.PageEvents.AddEvent, newEvent);
                ExtensionHelper.sendMessageAsync({
                    eventName: FeatureEvents.PageEvents.EventUpdated,
                    eventArg: newEvent
                });
            }
        });

        currentEvents = await this.featureProvider.RunAsync(FeatureEvents.PageEvents.GetEvents);
        if (currentEvents.length > 0) {
            this.listenToProgress();
        }

        if (state.focused === true) {
            globalThis.setTimeout(this.checkForEventsAsync.bind(this), state.checkEventsTimeout);
        } else {
            state.listeningToEvents = false;
        }
    }

    listenToProgress() {
        if (state.listeningToProgress === true) {
            return;
        }
        state.listeningToProgress = true;
        this.checkForProgressAsync();
    }

    async checkForProgressAsync() {
        /** @type {PageEvent[]} */
        const pendingEvents = await this.featureProvider.RunAsync(FeatureEvents.PageEvents.GetEvents, /** @param {PageEvent} e */ e => e.completed === false);
        await this.featureProvider.RunAsync(FeatureEvents.PageEvents.SetEvents, pendingEvents);

        if (pendingEvents.length > 0) {
            for (const pageEvent of pendingEvents) {
                const pageEventSnapshot = pageEvent.clone();
                await this.featureProvider.RunAsync(FeatureEvents.PageEvents.CheckEventProgress, pageEvent);
                if (!pageEventSnapshot.deepEquals(pageEvent)) {
                    ExtensionHelper.sendMessageAsync({
                        eventName: FeatureEvents.PageEvents.EventUpdated,
                        eventArg: pageEvent,
                    });
                }
            }

            globalThis.setTimeout(this.checkForProgressAsync.bind(this), state.checkProgressTimeout);
        } else {
            state.listeningToProgress = false;
        }
    }
}
