/**
 * @callback FilterFunction
 * @param {QueryElement} element
 * @returns {Boolean}
 */

/**
 * Represents query element wrapper class
 */
export default class QueryElement {
    /**
     * Creates a new instance of query element wrapper
     * @param {HTMLElement|HTMLCollection|NodeList|Array} elements elements
     */
    constructor(elements) {
        /** @type {HTMLElement[]} */
        let elementsArray;
        if (elements.constructor !== Array) {
            if (elements instanceof HTMLCollection || elements instanceof NodeList) {
                elementsArray = /** @type {HTMLElement[]} */ ([...elements]);
            } else {
                elementsArray = /** @type {HTMLElement[]} */ ([elements]);
            }
        } else {
            elementsArray = /** @type {Array} */ (elements);
        }
        /** @type {HTMLElement[]} */
        this.elements = elementsArray;
        /** @type {Number} */
        this.length = elementsArray.length;
    }

    // Traversing
    /**
     * Gets the children elements
     * @param {FilterFunction|String} [filter] filter
     * @returns {QueryElement}
     */
    children(filter) {
        return new QueryElement(this.elements.flatMap(element => [...element.children])).filter(filter);
    };

    /**
     * Gets the child nodes
     * @param {FilterFunction|String} [filter] filter
     * @returns {QueryElement}
     */
    contents(filter) {
        return new QueryElement(this.elements.flatMap(element => [...element.childNodes])).filter(filter);
    };

    /**
     * Gets the parent element
     * @param {FilterFunction|String} [filter] filter
     * @returns {QueryElement}
     */
    parent(filter) {
        return new QueryElement(this.elements.map(element => element.parentElement)).filter(filter);
    };

    /**
     * Gets the next element sibling
     * @param {FilterFunction|String} [filter] filter
     * @returns {QueryElement}
     */
    next(filter) {
        return new QueryElement(this.elements.map(element => element.nextElementSibling)).filter(filter);
    };

    /**
     * Gets the elements matching provided selector
     * @param {String} selector selector
     * @returns {QueryElement}
     */
    find(selector) {
        return new QueryElement(this.elements.flatMap(element => [...element.querySelectorAll(selector)]));
    };

    // Selecting
    /**
     * Filters the elements
     * @param {FilterFunction|String} filter filter
     * @returns {QueryElement}
     */
    filter(filter) {
        if (filter === undefined) {
            return this;
        }
        if (typeof filter === "string") {
            const filterSelector = filter;
            filter = element => element.is(filterSelector);
        }
        const filterResult = this.elements.filter(element => /** @type {FilterFunction} */ (filter)(new QueryElement(element)));
        return new QueryElement(filterResult);
    };

    /**
     * Maps the elements
     * @param {function(QueryElement): Object} mapFunction mapping function
     * @returns {QueryElement}
     */
    map(mapFunction) {
        const mapResult = this.elements.map(element => mapFunction(new QueryElement(element)));
        return new QueryElement(mapResult);
    };

    /**
     * Iterates through the elements
     * @param {function(QueryElement): void} iterateFunction loop function
     */
    each(iterateFunction) {
        this.elements.forEach(element => iterateFunction(new QueryElement(element)));
    }

    /**
     * Gets the nth element
     * @param {Number} i
     * @returns {QueryElement} element
     */
    get(i) {
        if (i < 0) {
            i += this.elements.length;
        }
        return new QueryElement(i >= 0 && i < this.elements.length ? this.elements[i] : []);
    }

    /**
     * Gets the first element
     * @param {function(QueryElement): Object} [filter] filter
     * @returns {QueryElement}
     */
    first(filter) {
        return filter === undefined ? this.get(0) : this.filter(filter).get(0);
    };

    /**
     * Gets the last element
     * @param {function(QueryElement): Object} [filter] filter
     * @returns {QueryElement}
     */
    last(filter) {
        return filter === undefined ? this.get(-1) : this.filter(filter).get(-1);
    };

    // Content
    /**
     * Gets the text of the element
     * @returns {String}
     */
    text() {
        return this.elements.length ? (this.elements[0] instanceof Text ? this.elements[0].textContent : this.elements[0].innerText) || "" : "";
    };

    /**
     * Gets the property value
     * @param {String} propertyName property name
     * @returns {Object}
     */
    prop(propertyName) {
        return this.elements.length ? this.elements[0][propertyName] : null;
    };

    /**
     * Gets the attribute value
     * @param {String} attributeName attribute name
     */
    attr(attributeName) {
        return this.elements.length || this.elements[0].attributes[attributeName] ? this.elements[0].attributes[attributeName].value : null;
    };

    /**
     * Gets the dataset value
     * @param {String} dataKey data key
     * @returns {String}
     */
    data(dataKey) {
        return this.elements.length || this.elements[0].dataset[dataKey] ? this.elements[0].dataset[dataKey] : null;
    };

    /**
     * Gets the element screen offset
     * @returns {{ top: Number, left: Number }}
     */
    offset() {
        if (this.elements.length) {
            const rect = this.elements[0].getBoundingClientRect();
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
        }
        return { top: 0, left: 0 };
    };

    /**
     * Gets or sets the value
     * @param {Object} [newValue] new value
     * @returns {Object}
     */
    val(newValue) {
        if (newValue === undefined) {
            return this.elements.length ? /** @type {HTMLInputElement} */ (this.elements[0]).value : null;
        }
        if (this.elements.length) {
            /** @type {HTMLInputElement} */ (this.elements[0]).value = newValue;
        }
        return null;
    };

    // Condition check
    /**
     * Checks if the element matches the selector
     * @param {String} selector
     * @returns {Boolean}
     */
    is(selector) {
        if (!this.elements.length) {
            return false;
        }
        const matchingSelectorElements = this.parent().find(selector).elements;
        return this.elements.every(element => matchingSelectorElements.includes(element));
    };

    /**
     * Checks if the element has the class name
     * @param {String} className class name
     * @returns {Boolean}
     */
    hasClass(className) {
        if (!this.elements.length) {
            return false;
        }
        return this.elements.every(element => element.classList.contains(className));
    };
    
    /**
     * Checks if the element is visible
     * @returns {Boolean}
     */
    visible() {
        if (!this.elements.length) {
            return false;
        }
        return this.elements.every(element => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length));
    };

    // Event
    /**
     * Triggers a click on the element
     */
    click() {
        this.elements.forEach(element => element.click());
    };

    /**
     * Triggers an event on the element
     * @param {String} eventType event type
     */
    trigger(eventType) {
        const event = document.createEvent("Event");
        event.initEvent(eventType, false, true);
        this.elements.forEach(element => element.dispatchEvent(event));
    };
}