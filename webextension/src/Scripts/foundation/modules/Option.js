const handler = {
    /**
     * @param {Option} target
     * @param {String} property
     */
	get: (target, property) => {
        if (property in target) {
            return target[property];
        }
        
        const optionObj = target.value[property];
        if (optionObj === null || optionObj === undefined) {
            return null;
        }

        return optionObj.type === String || optionObj.type === Number || optionObj.type === Boolean ? optionObj.value : Option.Parse(optionObj, target.rootOption);
	}
};

export const deepClone = (source) => {
    if (typeof(source) === "object") {
        if (source.constructor === Array) {
            return [...source.map(item => deepClone(item))];
        }
        return deepCopy({}, source);
    }
    return source;
}

export const deepCopy = (target, source) => {
    for (const key in source) {
        if (typeof(target[key]) === "object" && target[key].constructor !== Array) {
            deepCopy(target[key], source[key]);
        } else {
            target[key] = deepClone(source[key]);
        }
    }
    return target;
}

/**
 * Option class
 */
export default class Option {
    type;
    name;
    value;
    rootOption;

    /**
     * Create an option instance
     * @param {Object} optionObj Option object
     */
    constructor(optionObj, rootOptionObj) {
        this.type = optionObj.type;
        this.name = optionObj.name;
        this.value = optionObj.value;
        this.rootOption = rootOptionObj;
        return new Proxy(this, handler);
    }

    /**
     * Parse the option object
     * @param {Object} optionObj Option object
     * @param {Object} [rootOptionObj] Root option object
     * @returns {Option}
     */
    static Parse(optionObj, rootOptionObj) {
        if (optionObj.type === Array) {
            //transform array into object
            const schema = optionObj.schema;
            const transformedObj = { 
                type: optionObj.type,
                name: optionObj.name,
                value: {}
            };
            for (const arrayValue of optionObj.value) {
                transformedObj.value[arrayValue.name] = deepCopy(deepClone(schema), arrayValue);
            }
            return new Option(transformedObj, rootOptionObj);
        }

        if (optionObj.type === Symbol) {
            let datasourceNode = rootOptionObj;
            let datasourcePath = optionObj.datasource;
            while (true) {
                let currentProperty = datasourcePath;
                if (datasourcePath.indexOf("/") > -1) {
                    currentProperty = datasourcePath.substring(0, datasourcePath.indexOf("/"));
                }
                datasourceNode = datasourceNode.value[currentProperty];
                datasourcePath = datasourcePath.substring(currentProperty.length + 1);
                if (!datasourcePath) {
                    break;
                }
            }
            let linkedObj = deepClone(datasourceNode.schema);
            if (datasourceNode.value.length) {
                let match = datasourceNode.value.find(datasourceValue => datasourceValue.name === optionObj.value);
                if (!match) {
                    match = datasourceNode.value[0];
                }
                linkedObj = deepCopy(linkedObj, match);
            }
            return new Option(linkedObj, rootOptionObj);
        }

        return new Option(optionObj, rootOptionObj);
    }
}