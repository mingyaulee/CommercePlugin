import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";
import PageEvent from "../../foundation/modules/PageEvent.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";

/**
 * Current Events Component feature
 */
export default class CurrentEventsComponent extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Page.PageLoaded:
                return await this.initializeAsync(executionContext);
            case FeatureEvents.PageEvents.EventUpdated:
                return await this.loadEventsAsync(executionContext);
            case FeatureEvents.PageEvents.CurrentEventsUpdated:
                this.renderEvents(executionContext.EventArg);
                return;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize component
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async initializeAsync(executionContext) {
        this.element = globalThis.document.getElementById("eventsContainer");
        await this.loadEventsAsync(executionContext);
    }

    /**
     * Load current events from background
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async loadEventsAsync(executionContext) {
        /** @type {Array} */
        const currentEventObjects = await ExtensionHelper.sendMessageAsync({
            eventName: FeatureEvents.PageEvents.GetEvents
        });

        const currentEvents = [];
        for (const currentEventObject of currentEventObjects) {
            const currentEvent = await executionContext.FeatureProvider.RunAsync(FeatureEvents.PageEvents.ParseObject, currentEventObject);
            currentEvents.push(currentEvent);
        }
        await executionContext.FeatureProvider.RunAsync(FeatureEvents.PageEvents.SetEvents, currentEvents);

        this.renderEvents(currentEvents);
    }

    /**
     * Load current events
     * @param {PageEvent[]} currentEvents current events
     */
    renderEvents(currentEvents) {
        const container = this.element;

        while (container.children.length) {
            container.children[0].remove();
        }

        for (const currentEvent of currentEvents) {
            const row = globalThis.document.createElement("div");
            row.className = "row";
            const column1 = globalThis.document.createElement("div");
            column1.className = "col-12 font-weight-bold";
            const titleLink = globalThis.document.createElement("a");
            titleLink.className = "text-decoration-none text-reset";
            titleLink.href = "#";
            titleLink.innerText = currentEvent.getTitle();
            titleLink.dataset.tabId = currentEvent.tabId.toString();
            titleLink.addEventListener("click", this.clickTitle);
            column1.appendChild(titleLink);
            const column2 = globalThis.document.createElement("div");
            column2.className = "col-12";

            row.appendChild(column1);
            row.appendChild(column2);
            container.appendChild(row);

            if (currentEvent.completed) {
                const icon = globalThis.document.createElement("img");
                icon.className = "mr-2";
                icon.src = "../Icons/icon" + (currentEvent.icon ? "-" + currentEvent.icon : "") + ".png";
                icon.width = icon.height = 30;
                column1.insertBefore(icon, column1.firstChild);
                column2.remove();
            } else {
                const progressBarContainer = globalThis.document.createElement("div");
                progressBarContainer.className = "progress";
                const progressBar = globalThis.document.createElement("div");

                progressBar.className = "progress-bar progress-bar-striped progress-bar-animated";
                progressBar.style.width = (currentEvent.progress || 100) + "%";

                progressBarContainer.appendChild(progressBar);
                column2.appendChild(progressBarContainer);
            }
        }

        if (currentEvents.length === 0) {
            const message = globalThis.document.createElement("div");
            message.className = "text";
            message.innerText = "No event";
            container.appendChild(message);
        }
    }

    /**
     * Click event handler
     * @param {MouseEvent} e mouse event
     */
    clickTitle(e) {
        ExtensionHelper.switchToTabAsync(Number(/** @type {HTMLElement} */(e.target).dataset.tabId));
    }
}