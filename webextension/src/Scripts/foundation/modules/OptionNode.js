import Option, { deepClone } from "./Option.js";

/**
 * Option node class
 */
export default class OptionNode {
    /** @type {Object} */
    node;
    /** @type {String} */
    key;
    /** @type {Object} */
    value;

    /**
     * Gets the option node by property path
     * @param {Object} optionObj option object
     * @param {String} propertyPath property path
     * @param {Boolean} createProperty create the property if it does not exist
     * @returns {OptionNode}
     */
    static GetOptionNodeByPropertyPath(optionObj, propertyPath, createProperty = false) {
        let isArray = false;
        let arraySchema = null;
        while (true) {
            let currentProperty = propertyPath;
            if (propertyPath.indexOf("/") > -1) {
                currentProperty = propertyPath.substring(0, propertyPath.indexOf("/"));
            }
            if (!optionObj.hasOwnProperty(currentProperty)) {
                if (createProperty) {
                    optionObj[currentProperty] = { value: currentProperty === propertyPath ? null : {} };
                } else if (isArray) {
                    optionObj[currentProperty] = deepClone(arraySchema);
                } else {
                    return null;
                }
            }
            if (currentProperty === propertyPath) {
                const node = new OptionNode();
                node.node= optionObj;
                node.key= propertyPath;
                node.value= optionObj[propertyPath].value;
                return node;
            } else {
                if (optionObj[currentProperty].type === Array) {
                    isArray = true;
                    arraySchema = optionObj[currentProperty].schema;
                }

                optionObj = Option.Parse(optionObj[currentProperty]).value;
                propertyPath = propertyPath.substring(currentProperty.length + 1);
            }
        }
    }

    /**
     * Removes the option node by property path
     * @param {Object} optionObj option object
     * @param {String} propertyPath property path
     * @param {Boolean} checkIfEmpty checks if the node is empty before deleting it
     */
    static RemoveOptionNodeByPropertyPath(optionObj, propertyPath, checkIfEmpty = false) {
        const optionNode = OptionNode.GetOptionNodeByPropertyPath(optionObj, propertyPath);
        if (optionNode !== null) {
            if (!checkIfEmpty || Object.keys(optionNode.node[optionNode.key].value).length === 0) {
                delete optionNode.node[optionNode.key];

                propertyPath = propertyPath.substring(0, propertyPath.length - optionNode.key.length - 1);
                if (propertyPath !== "") {
                    OptionNode.RemoveOptionNodeByPropertyPath(optionObj, propertyPath, true);
                }
            }
        }
    }
}