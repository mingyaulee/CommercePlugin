const handler = {
	get: (target, property) => {
		if (property.indexOf("$") === 0) {
			if (target[property] instanceof Function) {
				return target[property].bind(target);
			}
			return target[property];
		}
		return target.$data[target.$getKey(property)];
	},
	set: (target, property, value) => {
		target.$data[target.$getKey(property)] = value;
		return true;
	}
};

function parseQueryKeyValue(str) {
	let query = str.split("=");
	const key = query[0];
	query = query.slice(1);

	let value = "";
	if (query.length > 0) {
		value = query.join("=");
	}

	return {
		key: key,
		value: globalThis.decodeURIComponent(value)
	};
}

export default class QueryString {
	$data;

	/**
	 * Creates a new query string key-value collection, with case insensitive key
	 */
	constructor() {
		this.$data = {};
		return new Proxy(this, handler);
	}

	/**
	 * Parse the query string into a `QueryString` object
	 * @param {string} str query string
	 * @returns {QueryString} QueryString object
	 */
	static Parse(str) {
		const dict = new QueryString();
		const queries = str.split("&");
		for (const query of queries) {
			const parsed = parseQueryKeyValue(query);
			dict.$add(parsed.key, parsed.value);
		}
		return dict;
	}

	/**
	 * Converts key to access the collection
	 * @param {String} key the query string key
	 * @returns {String}
	 */
	$getKey(key) {
		return key.toLowerCase();
	}

	/**
	 * Checks if the collection contains the key provided
	 * @param {String} key the query string key
	 * @returns {Boolean} boolean
	 */
	$hasKey(key) {
		return this.$data.hasOwnProperty(this.$getKey(key));
	}

	/**
	 * Adds the key-value pair into the collection
	 * @param {String} key the query string key
	 * @param {String} value the query string value
	 */
	$add(key, value) {
		key = this.$getKey(key);
		if (this.$data.hasOwnProperty(key)) {
			this.$data[key].push(value);
		} else {
			this.$data[key] = new QueryValueCollection(value);
		}
	}
}

/**
 * Values collection
 * @extends Array
 */
export class QueryValueCollection extends Array {
	toString() {
		return this.join(",");
	}
}