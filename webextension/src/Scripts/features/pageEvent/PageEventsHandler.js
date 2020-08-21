import PageEvent from "../../foundation/modules/PageEvent.js";

import Feature from "../Feature.js";
import FeatureEvents from "../FeatureEvents.js";
import FeatureExecutionContext from "../FeatureExecutionContext.js";

const state = {
    currentEvents: []
};

/**
 * Page Events Handler feature
 */
export default class PageEventsHandler extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Tab.TabUpdated:
                this.onTabUpdated(executionContext);
                return;
            case FeatureEvents.Tab.TabRemoved:
                this.onTabRemoved(executionContext);
                return;
            case FeatureEvents.PageEvents.EventUpdated:
                return await this.onEventUpdatedAsync(executionContext);
            case FeatureEvents.PageEvents.AddEvent:
                this.addEvent(executionContext.EventArg);
                return;
            case FeatureEvents.PageEvents.GetEvents:
                return this.getEvents(executionContext.EventArg);
            case FeatureEvents.PageEvents.SetEvents:
                this.setEvents(executionContext.EventArg);
                return;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * On tab updated event
     * @param {FeatureExecutionContext} executionContext execution context
     */
    onTabUpdated(executionContext) {
        const changeInfo = executionContext.EventArg;
        if (changeInfo.status === "loading") {
            // Tab is redirecting to another URL
            this.removeEventsForTab(executionContext.TabId);
            this.currentEventsUpdated(executionContext);
        }
    }

    /**
     * On tab removed event
     * @param {FeatureExecutionContext} executionContext execution context
     */
    onTabRemoved(executionContext) {
        this.removeEventsForTab(executionContext.TabId);
        this.currentEventsUpdated(executionContext);
    }

    /**
     * On message received event
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async onEventUpdatedAsync(executionContext) {
        const pageEventObj = executionContext.EventArg;
        const pageEvent = await executionContext.FeatureProvider.RunAsync(FeatureEvents.PageEvents.ParseObject, pageEventObj);
        this.addEvent(pageEvent);
        this.currentEventsUpdated(executionContext);
    }

    /**
     * Gets the current page events
     * @param {function(PageEvent): Boolean} [filter] condition to filter events
     * @returns {PageEvent[]} page events
     */
    getEvents(filter) {
        if (filter) {
            return state.currentEvents.filter(filter);
        }
        return state.currentEvents;
    }

    /**
     * Sets the current page events
     * @param {PageEvent[]} events page events
     */
    setEvents(events) {
        state.currentEvents = events;
    }

    /**
     * Add a page event
     * @param {PageEvent} pageEvent page event
     */
    addEvent(pageEvent) {
        const existingEvents = this.getEvents(e => e.equals(pageEvent));
        if (existingEvents.length === 0) {
            state.currentEvents.push(pageEvent);
        } else {
            this.setEvents(state.currentEvents.map(x => x === existingEvents[0] ? pageEvent : x));
        }
    }

    /**
     * Remove page events for tab
     * @param {Number} tabId tab id
     */
    removeEventsForTab(tabId) {
        if (this.getEvents(x => x.tabId === tabId).length !== 0) {
            this.setEvents(state.currentEvents.filter(x => x.tabId !== tabId));
        }
    }

    /**
     * Trigger current events updated event
     * @param {FeatureExecutionContext} executionContext execution context
     */
    currentEventsUpdated(executionContext) {
        executionContext.FeatureProvider.RunAsync(FeatureEvents.PageEvents.CurrentEventsUpdated, state.currentEvents);
    }
}