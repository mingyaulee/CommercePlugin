import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";
import AutomationRunner from "../../features/automation/AutomationRunner.js";
import AutomationProviders from "../../features/automation/AutomationProviders.js";

import ProjectEvents from "../ProjectEvents.js";

/**
 * Automations Component feature
 */
export default class AutomationComponent extends Feature {
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
        this.logContainer = globalThis.document.getElementById("automationLog");
        this.logTitle = globalThis.document.getElementById("automationTitle");
        this.closeWindowButton = globalThis.document.getElementById("closeButton");
        this.attachEventListener();
        this.runAutomationAsync(executionContext);
    }

    /**
     * Attach on click event listener to button
     */
    attachEventListener() {
        this.closeWindowButton.addEventListener("click", () => { globalThis.window.close(); });
    }

    /**
     * Runs the automation task
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async runAutomationAsync(executionContext) {
        this.logTitle.innerText = "Running automation";
        const success = await executionContext.FeatureProvider.RunAsync(
            FeatureEvents.Automation.Run,
            {
                automationId: executionContext.ContextItems["automationId"],
                logger: this.automationLogger.bind(this)
            });
        this.logTitle.innerText = "Completed automation";
        if (success) {
            this.closeWindowButton.classList.remove("d-none");
            this.setCloseWindowTimeout();
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

    /**
     * Closes the window after timeout
     */
    setCloseWindowTimeout() {
        const buttonText = this.closeWindowButton.innerText;
        const duration = 5000;
        let currentTime = 0;
        setInterval(() => {
            this.closeWindowButton.innerText = `${buttonText} (${(Math.round((duration - currentTime) / 1000))})`
            if (currentTime >= duration) {
                setTimeout(() => {
                    globalThis.window.close();
                }, 300);
            }
            currentTime += 1000;
        }, 1000);
    }
}