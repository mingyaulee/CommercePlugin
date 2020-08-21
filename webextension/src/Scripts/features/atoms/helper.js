import QueryElement from "../../foundation/modules/QueryElement.js";

const helper = (function () {
    /**
     * Wait for condition
     * @param {function(): Boolean} condition condition to check
     * @param {Object} [waitOption] wait option
     * @param {Number} [waitOption.timeoutMs] wait timeout
     * @param {Number} [waitOption.pollMs] poll time
     * @param {Number} [waitOption.delayMs] delay time
     * @returns {Promise}
     */
    const waitForConditionAsync = async (condition, waitOption = {}) => {
        return new Promise((resolve, reject) => {
            const startTime = new Date().getTime();
            const maxEndTime = startTime + (waitOption.timeoutMs || AtomContext(context => { context.options.Automations.TimeoutMs }));
            const checkCondition = async () => {
                const result = condition();
                if (!result) {
                    if (new Date().getTime() < maxEndTime) {
                        setTimeout(checkCondition, waitOption.pollMs || 1000);
                    } else {
                        console.error("Condition is not true after timeout", condition);
                        reject("Condition is not true after timeout");
                    }
                } else {
                    resolve();
                }
            };
            if (waitOption.delayMs) {
                setTimeout(checkCondition, waitOption.delayMs);
            } else {
                checkCondition();
            }
        });
    };

    /**
     * Wait for ajax calls to be completed
     * @returns {Promise}
     */
    const waitForAjaxAsync = () => waitForConditionAsync(() => {
        let ajaxCount = 0;
        if (window["jQuery"]) {
            ajaxCount += window["jQuery"]["active"];
        }
        return ajaxCount === 0;
    }, { delayMs: 500, pollMs: 1000 });

    /**
     * Queries element by selector
     * @param {String} selector selector
     * @returns {QueryElement}
     */
    const queryElement = selector => {
        return new QueryElement(document.body).find(selector);
    };

    return {
        waitForAjaxAsync: waitForAjaxAsync,
        waitForConditionAsync: waitForConditionAsync,
        queryElement: queryElement
    };
})();

export default helper;