import AutomationTask from "../../foundation/modules/AutomationTask.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";
import AutomationRunner from "../../features/automation/AutomationRunner.js";
import AutomationProviders from "../../features/automation/AutomationProviders.js";

import ProjectEvents from "../ProjectEvents.js";

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
                this.initialize(executionContext);
                return;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize component
     * @param {FeatureExecutionContext} executionContext execution context
     */
    initialize(executionContext) {
        this.tabId = executionContext.TabId;
        this.featureProvider = executionContext.FeatureProvider;
        this.element = globalThis.document.getElementById("automationsContainer");
        this.button = globalThis.document.getElementById("automationsButton");
        if (this.element && this.button) {
            this.attachEventListener();
        }
    }

    /**
     * Attach on click event listener to button
     */
    attachEventListener() {
        this.button.addEventListener("click", this.toggleAutomationContainerAsync.bind(this));
    }

    /**
     * Toggle available automation container
     */
    async toggleAutomationContainerAsync() {
        const container = this.element;
        if (container.classList.contains("d-none")) {
            container.classList.remove("d-none");
            while (container.children.length) {
                container.children[0].remove();
            }

            const logContainerTitle = globalThis.document.createElement("li");
            logContainerTitle.className = "list-group-item list-group-item-primary font-weight-bold d-none";
            logContainerTitle.innerText = "Log";
            logContainerTitle.id = "automationLogTitle";

            const logContainer = globalThis.document.createElement("li");
            logContainer.className = "list-group-item d-none";
            logContainer.id = "automationLog";

            container.appendChild(logContainerTitle);
            container.appendChild(logContainer);
            this.logContainerTitle = logContainerTitle;
            this.logContainer = logContainer;
        } else {
            container.classList.add("d-none");
            return;
        }
        const automationTasks = await this.loadAvailableAutomationTasksAsync();
        this.renderAutomationTasks(container, automationTasks);
    }

    /**
     * Loads available automations
     */
    async loadAvailableAutomationTasksAsync() {
        const tabState = await this.featureProvider.RunAsync(FeatureEvents.Tab.GetTabState, this.tabId);
        const automationTasksArray = await this.featureProvider.RunAsync(FeatureEvents.Automation.GetAutomationByTabState, tabState);
        const automationTasks = automationTasksArray.flat();
        return automationTasks;
    }

    /**
     * Renders the automation tasks
     * @param {HTMLElement} container render container
     * @param {AutomationTask[]} automationTasks automation task array
     */
    renderAutomationTasks(container, automationTasks) {
        if (automationTasks.length) {
            // Group the automation tasks by type
            const automationTypes = {};
            automationTasks.forEach(automationTask => {
                if (!automationTypes.hasOwnProperty(automationTask.type)) {
                    automationTypes[automationTask.type] = [];
                }
                
                if (automationTypes[automationTask.type].indexOf(automationTask) === -1) {
                    automationTypes[automationTask.type].push(automationTask);
                }
            });

            for (const automationType in automationTypes) {
                this.renderAutomationTaskGroup(container, automationType, automationTypes[automationType]);
            }
        } else {
            const emptyElement = globalThis.document.createElement("li");
            emptyElement.className = "list-group-item";
            emptyElement.innerText = "No Automation available";
            container.appendChild(emptyElement);
        }
    }

    /**
     * Renders the automation tasks in a group
     * @param {HTMLElement} container render container
     * @param {String} groupName group name
     * @param {AutomationTask[]} automationTasks automation tasks
     */
    renderAutomationTaskGroup(container, groupName, automationTasks) {
        const header = globalThis.document.createElement("li");
        header.className = "list-group-item list-group-item-dark font-weight-bold";
        header.innerText = groupName;
        container.appendChild(header);

        for (const automationTask of automationTasks) {
            const dropdownItem = globalThis.document.createElement("li");
            dropdownItem.className = "list-group-item d-flex justify-content-between align-items-center py-0 pr-0";
            dropdownItem.appendChild(globalThis.document.createTextNode(automationTask.name));
            const runButton = globalThis.document.createElement("button");
            runButton.className = "btn btn-primary btn-md rounded-0 px-3 float-right";
            runButton.innerText = "Run";
            dropdownItem.appendChild(runButton);

            this.bindRunAutomationOnClick(runButton, automationTask);
            container.appendChild(dropdownItem);
        }
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
        this.clearAutomationLogContainer();
        this.featureProvider.RunAsync(
            FeatureEvents.Automation.Run,
            {
                automationTask: automationTask,
                logger: this.automationLogger.bind(this)
            }
        )
        return false;
    }

    /**
     * Clears the contents of log container
     */
    clearAutomationLogContainer() {
        this.logContainerTitle.classList.remove("d-none");
        const logContainer = this.logContainer;
        logContainer.classList.remove("d-none");
        while (logContainer.children.length) {
            logContainer.children[0].remove();
        }
    }

    /**
     * Logs messages to log container
     * @param {String} type log type
     * @param {String} message log message
     */
    automationLogger(type, message) {
        const timestampElement = globalThis.document.createElement("div");
        timestampElement.className = "px-2 text-success log-line-timstamp";
        timestampElement.innerText = new Date().toLocaleTimeString();
    
        const messageElement = globalThis.document.createElement("div");
        messageElement.className = "text-" + type;
        messageElement.innerText = message;
    
        const rowElement = globalThis.document.createElement("div");
        rowElement.className = "d-flex log-line";
        rowElement.appendChild(timestampElement);
        rowElement.appendChild(messageElement);
    
        const logContainer = this.logContainer;
        logContainer.appendChild(rowElement);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}