/**
 * @callback AsyncReplacerFunction 
 * @param {String} match match
 * @param {String[]} matchGroups match groups
 * @returns {Promise<String>}
 */

export default class StringHelper {
    /**
     * Format string with the given object
     * @param {String} template string template
     * @param {Object} dictionary dictionary object to provide values to be inserted
     * @returns {String} formatted string
     */
    static formatTemplate(template, dictionary) {
        return template.replace(/{\w+}/g, (match) => {
            const propertyName = match.substring(1, match.length - 1);
            if (dictionary.hasOwnProperty(propertyName) && dictionary[propertyName] !== undefined) {
                return dictionary[propertyName];
            }
            return match;
        });
    }

    /**
     * Replaces the text with async replacer function
     * @param {String} text text
     * @param {RegExp} pattern replace pattern
     * @param {AsyncReplacerFunction} asyncReplacer 
     * @returns {Promise<string>}
     */
    static async replaceAsync(text, pattern, asyncReplacer) {
        const promises = [];
        text.replace(pattern, (match, ...matchGroups) => {
            promises.push(asyncReplacer(match, matchGroups));
            return match;
        });
        const data = await Promise.all(promises);
        return text.replace(pattern, () => data.shift());
    }
}