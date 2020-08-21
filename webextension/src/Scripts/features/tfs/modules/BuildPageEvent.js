import PageEvent from "../../../foundation/modules/PageEvent.js";

/**
 * Enum for page event results
 * @readonly
 * @enum {String}
 */
export const BuildEventStatus = {
    BuildSuccess: "Completed",
    BuildWarning: "Warning",
    BuildFailed: "Failed",
    BuildCanceled: "Canceled"
};

/**
 * Build page event
 */
export default class BuildPageEvent extends PageEvent {
    static Type = "TFS.Build";

    /**
     * Creates a new build page event
     * @param {String|Number} [id]
     */
    constructor(id) {
        super(BuildPageEvent.Type, id);
        /** @type {String} */
        this.version = null;
    }

    /**
     * @override
     * @param {BuildPageEvent} pageEvent page event to compare to
     * @returns {Boolean} boolean
     */
    deepEquals(pageEvent) {
        return super.deepEquals(pageEvent) &&
            pageEvent.version === this.version;
    }

    /**
     * @override
     */
    clone() {
        const cloned = new BuildPageEvent(this.id);
        this.cloneProperties(cloned);
        return cloned;
    }

    /**
     * @override
     * @param {BuildPageEvent} pageEvent page event
     */
    cloneProperties(pageEvent) {
        super.cloneProperties(pageEvent);
        pageEvent.version = this.version;
    }

    /**
     * @override
     */
    getTitle() {
        return "Build " + (this.version ?? this.id);
    }

    /**
     * @override
     */
    getStatusMessage() {
        return this.status;
    }
}