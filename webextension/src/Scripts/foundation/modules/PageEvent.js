/**
 * Enum for page event icons
 * @readonly
 * @enum {String}
 */
export const PageEventIcon = {
    Success: "success",
    Fail: "fail"
};

export default class PageEvent {
    /**
     * Gets the page event type
     * @type {String}
     */
    type;

    /**
     * Gets the page event id
     * @type {String|Number}
     */
    id;

    /**
     * Gets the completed state of the page event
     * @type {Boolean}
     */
    completed;

    /**
     * Gets the status of the page event
     * @type {?String}
     */
    status;

    /**
     * Gets the status message of the page event
     * @type {?String}
     */
    statusMessage;

    /**
     * Gets the icon of the page event
     * @type {?PageEventIcon}
     */
    icon;

    /**
     * Gets the progress of the page event
     * @type {?Number}
     */
    progress;

    /**
     * Gets the tab id of the page event
     * @type {?Number}
     */
    tabId;

    /**
     * Creates a new page event
     * @param {String} type Page event type, use `PageEventType`
     * @param {String|Number} [id] Page event id
     */
    constructor(type, id = null) {
        this.type = type;
        this.id = id;
        this.completed = false;
        this.status = null;
        this.statusMessage = null;
        this.icon = null;
        this.progress = null;
        this.tabId = null;
    }

    /**
     * Compares if two PageEvent is equal
     * @param {PageEvent} pageEvent page event to compare to
     * @returns {Boolean}
     */
    equals(pageEvent) { return this.type === pageEvent.type && this.id === pageEvent.id; }

    /**
     * Deeply compares if two PageEvent properties are equal
     * @param {PageEvent} pageEvent page event to compare to
     * @returns {Boolean}
     */
    deepEquals(pageEvent) {
        return this.type === pageEvent.type
            && this.id === pageEvent.id
            && this.completed === pageEvent.completed
            && this.status === pageEvent.status
            && this.statusMessage === pageEvent.statusMessage
            && this.icon === pageEvent.icon
            && this.progress === pageEvent.progress
            && this.tabId === pageEvent.tabId;
    }

    /**
     * Clones the current instance
     * @returns {PageEvent}
     */
    clone() {
        const clone = new PageEvent(this.type, this.id);
        this.cloneProperties(clone);
        return clone;
    }

    /**
     * Clones the properties of current instance to the page event provided
     * @param {PageEvent} pageEvent page event
     */
    cloneProperties(pageEvent) {
        pageEvent.type = this.type;
        pageEvent.id = this.id;
        pageEvent.completed = this.completed;
        pageEvent.status = this.status;
        pageEvent.statusMessage = this.statusMessage;
        pageEvent.icon = this.icon;
        pageEvent.progress = this.progress;
        pageEvent.tabId = this.tabId;
    }

    /**
     * Sets the page event to complete with the provided status
     * @param {String} status the status for completion
     */
    complete(status) {
        this.status = status;
        this.completed = true;
    };

    /**
     * Gets the title of the page event
     * @abstract
     * @returns {String} the title
     */
    getTitle() { throw new Error("Not implemented."); }

    /**
     * Gets the status message of the page event
     * @abstract
     * @returns {String} the status message
     */
    getStatusMessage() { throw new Error("Not implemented."); }
}
