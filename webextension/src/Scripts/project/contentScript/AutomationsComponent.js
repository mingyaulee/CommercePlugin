import AutomationTask from "../../foundation/modules/AutomationTask.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";
import AutomationRunner from "../../features/automation/AutomationRunner.js";
import AutomationProviders from "../../features/automation/AutomationProviders.js";

import ProjectEvents from "../ProjectEvents.js";
import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

/**
 * Automations Component feature
 */
export default class AutomationsComponent extends Feature {
    /**
     * @override
     * @param {Feature[]} features features array
     */
    RegisterFeature(features) {
        super.RegisterFeature(features);
        new AutomationRunner().RegisterFeature(features);
        new AutomationProviders().RegisterFeature(features);
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
    async initializeAsync(executionContext) {
        this.tabId = executionContext.TabId;
        this.featureProvider = executionContext.FeatureProvider;
        const automationTasks = await this.loadAvailableAutomationTasksAsync();
        const inPageAutomationTasks = automationTasks.filter(automationTask => automationTask.appendToPageSelector);
        if (inPageAutomationTasks.length) {
            this.renderAutomationTasks(inPageAutomationTasks);
        }
    }

    /**
     * Loads available automations
     * @returns {Promise<AutomationTask[]>}
     */
    async loadAvailableAutomationTasksAsync() {
        const tabState = await this.featureProvider.RunAsync(FeatureEvents.Tab.GetTabState, this.tabId);
        const automationTasksArray = await this.featureProvider.RunAsync(FeatureEvents.Automation.GetAutomationByTabState, tabState);
        const automationTasks = automationTasksArray.flat();
        return automationTasks;
    }

    /**
     * Renders the automation tasks
     * @param {AutomationTask[]} automationTasks automation task array
     */
    renderAutomationTasks(automationTasks) {
        // Group the automation tasks by container
        const automationContainers = [];
        automationTasks.forEach(automationTask => {
            const parentElement = globalThis.document.querySelector(automationTask.appendToPageSelector);
            if (!parentElement) {
                return;
            }

            if (!automationContainers.some(automationContainer => automationContainer.parentElement === parentElement)) {
                automationContainers.push({
                    parentElement: parentElement,
                    container: this.createAutomationContainer(parentElement)
                });
            }

            const automationContainer = automationContainers.find(automationContainer => automationContainer.parentElement === parentElement).container;
            this.renderAutomationTask(automationContainer, automationTask);
        });

        if (automationContainers.length) {
            this.insertAutomationStyles();
            this.automationContainers = automationContainers.map(automationContainer => automationContainer.container);
            this.addClickEventListener();
            this.addKeyEventListener();
            this.showAllAutomations();
        }
    }

    /**
     * Inserts the automation css styles into the page
     */
    insertAutomationStyles() {
        const link = globalThis.document.createElement("link");
        link.href = ExtensionHelper.getURL("Styles/contentScriptAutomation.css");
        link.rel = "stylesheet";
        globalThis.document.head.appendChild(link);
    }

    /**
     * Creates the automation container
     * @param {Element} parent
     * @returns {HTMLDivElement} container
     */
    createAutomationContainer(parent) {
        const relativeContainer = globalThis.document.createElement("div");
        relativeContainer.className = "content-script-automation-relative-container";

        const container = globalThis.document.createElement("div");
        container.className = "content-script-automation-container";

        relativeContainer.appendChild(container);
        parent.prepend(relativeContainer);

        return container;
    }

    /**
     * Renders the automation tasks in a group
     * @param {HTMLElement} container render container
     * @param {AutomationTask} automationTask automation tasks
     */
    renderAutomationTask(container, automationTask) {
        const item = globalThis.document.createElement("span");
        item.className = "content-script-automation-item"
        item.appendChild(globalThis.document.createTextNode(automationTask.name));

        this.bindRunAutomationOnClick(item, automationTask);
        container.appendChild(item);
    }

    /**
     * Binds button on click event to run automation task
     * @param {HTMLElement} element button element
     * @param {AutomationTask} automationTask automation task
     */
    bindRunAutomationOnClick(element, automationTask) {
        element.addEventListener("click", this.runAutomation.bind(this, automationTask));
    }

    /**
     * Runs the automation task
     * @param {AutomationTask} automationTask automation task
     */
    runAutomation(automationTask) {
        this.featureProvider.RunAsync(
            FeatureEvents.Automation.RunInNewTab,
            {
                automationTask: automationTask
            }
        );
        return false;
    }

    /**
     * Hides the containers after a click on anywhere in the body except for the automation container
     */
    addClickEventListener() {
        if (this.hasClickEventListener) {
            return;
        }
        const onClickHandler = (/** @type {MouseEvent} */event) => {
            this.hasClickEventListener = false;
            globalThis.document.body.removeEventListener("click", onClickHandler);
            this.hideAllAutomations();
        };
        this.hasClickEventListener = true;
        globalThis.document.body.addEventListener("click", onClickHandler);
    }

    /**
     * Hides the containers after a click on anywhere in the body except for the automation container
     */
    addKeyEventListener() {
        const onClickHandler = () => {
            globalThis.document.body.removeEventListener("click", onClickHandler);
            this.hideAllAutomations();
        };
        globalThis.document.body.addEventListener("keydown", (/** @type {KeyboardEvent} */ event) => {
            if (event.ctrlKey && !this.isShowingAutomations) {
                this.addClickEventListener();
                this.showAllAutomations();
            }
        });
    }

    /**
     * Shows all automations in page
     */
    showAllAutomations() {
        this.isShowingAutomations = true;
        globalThis.document.body.classList.add("show-automations");
    }

    /**
     * Hides all automations in page
     */
    hideAllAutomations() {
        this.isShowingAutomations = false;
        globalThis.document.body.classList.remove("show-automations");
    }
}