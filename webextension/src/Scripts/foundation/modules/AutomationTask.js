import BaseScriptHelper from "../helpers/BaseScriptHelper.js";
import LogHelper from "../helpers/LogHelper.js";

/**
 * @callback ExecuteTaskFunction
 * @param {AutomationContext} context the automation context
 * @returns {Void}
 */

/**
 * @callback GenericLoggerFunction
 * @param {String} type log type
 * @param {String} message log message
 * @returns {Void}
 */

/**
 * @callback LoggerFunction
 * @param {...Object} message log message
 * @returns {Void}
 */

/**
 * @callback EndTaskFunction
 * @param {Boolean} success
 * @returns {Void}
 */

/**
 * @callback ExecuteSubtaskFunction
 * @param {AutomationTask} task task to execute
 * @param {Boolean} suppressLog suppress log from task
 * @returns {Promise}
 */

/**
 * Automation Task
 */
export default class AutomationTask {
    /**
     * Gets the id of the automation task
     * @type {String}
     */
    id;

    /**
     * Gets the type of the automation task
     * @type {String}
     */
    type;

    /**
     * Gets the name of the automation task
     * @type {String}
     */
    name;

    /**
     * Gets the selector to append to page
     * @type {String}
     */
    appendToPageSelector;

    /**
     * Gets the task to execute
     * @type {ExecuteTaskFunction}
     */
    executeTask;

    /**
     * Creates a new automation task
     * @param {String} id Id of task
     */
    constructor(id) {
        this.id = id;
    }

    /**
     * Sets the type
     * @param {String} type Type of task
     * @returns {AutomationTask}
     */
    withType(type) {
        this.type = type;
        return this;
    }

    /**
     * Sets the name
     * @param {String} name Name of task
     * @returns {AutomationTask}
     */
    withName(name) {
        this.name = name;
        return this;
    }

    /**
     * Sets the selector to append to page
     * @param {String} appendToPageSelector Task to execute
     * @returns {AutomationTask}
     */
    withSelector(appendToPageSelector) {
        this.appendToPageSelector = appendToPageSelector;
        return this;
    }

    /**
     * Sets the execute task function
     * @param {ExecuteTaskFunction} executeTaskFunction Task to execute
     * @returns {AutomationTask}
     */
    withExecuteFunction(executeTaskFunction) {
        this.executeTask = executeTaskFunction;
        return this;
    }

    /**
     * Executes the automation task
     * @param {BaseScriptHelper} scriptHelper script helper
     * @param {Number} tabId current tab id
     * @param {Object} options options
     * @param {GenericLoggerFunction} logger logger
     */
    executeAsync(scriptHelper, tabId, options, logger) {
        return new Promise(resolve => {
            const startTaskFunc = async (/** @type {AutomationContext} */ context) => {
                context.Info(`Task ${this.name} started`);
                try {
                    await this.executeTask(context);
                } catch (error) {
                    context.Error(`Task ${this.name} ended with error`, error);
                    LogHelper.error(`Task ${this.name} ended with error`, error);
                    context.End(false);
                }
            };
            const endTaskFunc = (context, success) => {
                context.Info(`Task ${this.name} ended`);
                resolve(success);
            };
            const executeSubtaskFunc = (/** @type {AutomationContext} */ context,
                                        /** @type {AutomationTask} */ subtask,
                                        /** @type {boolean} */ suppressLog) => {
                return new Promise(resolveSubtask => {
                    const startSubtaskFunc = async (subtaskContext) => {
                        context.Info(`Subtask ${subtask.name} started`);
                        try {
                            await subtask.executeTask(subtaskContext);
                        } catch (error) {
                            context.Error(`Subtask ${subtask.name} ended with error: ${error.message}`);
                            LogHelper.error(`Subtask ${subtask.name} ended with error`, error);
                            subtaskContext.end(false);
                        }
                    };
                    const endSubtaskFunc = (subtaskContext, success) => {
                        context.Info(`Subtask ${subtask.name} ended`);
                        resolveSubtask(success);
                    };
                    const subtaskContext = new AutomationContext(scriptHelper, context.TabId, context.Options, context.Logger, endSubtaskFunc, executeSubtaskFunc);
                    if (suppressLog) {
                        subtaskContext.Info = subtaskContext.Success = subtaskContext.Error = () => { };
                    }
                    startSubtaskFunc(subtaskContext);
                });
            };
            const context = new AutomationContext(scriptHelper, tabId, options, logger, endTaskFunc, executeSubtaskFunc);
            startTaskFunc(context);
        });
    }
}

/**
 * Automation Context class
 */
export class AutomationContext {
    /**
     * Gets the script helper
     * @type {BaseScriptHelper}
     */
    ScriptHelper;

    /**
     * Gets the current tab id
     * @type {Number}
     */
    TabId;

    /**
     * Gets the options
     * @type {Object}
     */
    Options;

    /**
     * Gets the generic logger
     * @type {GenericLoggerFunction}
     */
    Logger;

    /**
     * Log message as info type
     * @type {LoggerFunction}
     */
    Info;

    /**
     * Log message as success type
     * @type {LoggerFunction}
     */
    Success;

    /**
     * Log message as error type
     * @type {LoggerFunction}
     */
    Error;

    /**
     * Ends the current task
     * @type {EndTaskFunction}
     */
    End;

    /**
     * Execute subtask
     * @type {ExecuteSubtaskFunction}
     * @function
     * @param {String} test
     */
    ExecuteSubtaskAsync;

    /**
     * Creates a new instance of Automation Context
     * @param {BaseScriptHelper} scriptHelper script helper
     * @param {Number} tabId current tab id
     * @param {Object} options options
     * @param {GenericLoggerFunction} logger generic logger
     * @param {function(AutomationContext, Boolean): void} endFunc callback to end the current task
     * @param {function(AutomationContext, AutomationTask, Boolean): void} executeSubtaskFunc callback to execute a subtask
     */
    constructor(scriptHelper, tabId, options, logger, endFunc, executeSubtaskFunc) {
        this.ScriptHelper = scriptHelper;
        this.TabId = tabId;
        this.Options = options;
        this.Logger = logger;
        this.Info = logger.bind(null, "info");
        this.Success = logger.bind(null, "success");
        this.Error = logger.bind(null, "danger");
        this.End = endFunc.bind(null, this);
        this.ExecuteSubtaskAsync = executeSubtaskFunc.bind(null, this);
    }
}