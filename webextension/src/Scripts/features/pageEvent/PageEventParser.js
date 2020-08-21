import PageEvent from "../../foundation/modules/PageEvent.js";

import Feature from "../Feature.js";
import FeatureEvents from "../FeatureEvents.js";
import FeatureExecutionContext from "../FeatureExecutionContext.js";
import BuildPageEvent from "../tfs/modules/BuildPageEvent.js";

/**
 * Page Event Parser feature
 */
export default class PageEventParser extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.PageEvents.ParseObject:
                return this.parsePageEventObject(executionContext.EventArg);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * On page load event
     * @param {Object} pageEventObj page event object
     * @returns {PageEvent} page event
     */
    parsePageEventObject(pageEventObj) {
        let pageEvent;
        if (pageEventObj.type) {
            switch (pageEventObj.type) {
                case BuildPageEvent.Type:
                    pageEvent = new BuildPageEvent(pageEventObj.id);
                    break;
                default:
                    pageEvent = new PageEvent(pageEventObj.type, pageEventObj.id);
                    break;
            }
        }
        for (const i in pageEventObj) {
			if (pageEvent.hasOwnProperty(i)) {
				pageEvent[i] = pageEventObj[i];
			}
		}
        return pageEvent;
    }
}