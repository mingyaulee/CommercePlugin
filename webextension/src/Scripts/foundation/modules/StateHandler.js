export default class StateHandler {
    /**
     * Gets the array of states in the handler
     * @type {Array}
     */
    state;

    /**
     * Gets the default state if there is no matching id found
     * @type {Object}
     */
    emptyState;

    /**
     * Creates a new state handler
     * @param {Object} [emptyState] the default state if not matching id is found
     */
    constructor(emptyState) {
        this.state = [];
        this.emptyState = emptyState;    
    }

    /**
     * Gets the state with the matching id
     * @param {String | Number} id the id
     * @returns {Object} state object
     */
    get(id) {
        const existingState = this.state.filter(s => s.id === id);
        if (existingState.length) {
            return existingState[0];
        }
        return this.emptyState;
    }

    /**
     * Updates the state with matching id
     * @param {Object} state the state to update
     */
    update(state) {
        let existingState = this.state.filter(s => s.id === state.id);
        if (!existingState.length) {
            existingState = { ...this.emptyState };
            this.state.push(existingState);
        } else {
            existingState = existingState[0];
        }
        for (const i in state) {
            existingState[i] = state[i];
        }
    }

    /**
     * Removes the state with matching id
     * @param {String | Number} id the id
     */
    remove(id) {
        this.state = this.state.filter(s => s.id !== id);
    }

    /**
     * Clears all states in the state handler
     */
    clear() {
        this.state = [];
    }
}