import BaseScriptHelper, * as BaseScriptHelperExports from "../helpers/BaseScriptHelper.js";
import ExtensionHelper from "../helpers/ExtensionHelper.js";
import ModuleHelper from "../helpers/ModuleHelper.js";
import StringHelper from "../helpers/StringHelper.js";

/**
 * Accesses the context variables, the variables will be provided in runtime
 * Usage must be in the format of `AtomContext(context => { context.(do something with context) })`
 * @param {function(AtomExecutionContext): Object} contextAccessor
 * @returns {Object}
 */
globalThis.AtomContext = (contextAccessor) => { };

/**
 * Converts object to string
 * @param {Object} obj object
 */
function stringify(obj) {
    return JSON.stringify(obj);
}

/**
 * Atom Execution Context class
 */
class AtomExecutionContext {
    /** @type {Object} */
    options;
}

export default class Atom {
    /**
     * Gets the content of the atom to import
     * @param {String} name atom name
     * @param {String} path atom path
     * @param {AtomExecutionContext} [atomContext] context
     * @returns {Promise<String>}
     */
    static async GetAtomAsync(name, path, atomContext) {
        const atomPath = ExtensionHelper.getURL(`Scripts/features/atoms/${path}`);
        let responseText = await ModuleHelper.flattenModuleContentAsync(`import ${name} from "./${name}.js"`, atomPath);
        if (atomContext) {
            responseText = await StringHelper.replaceAsync(responseText, /AtomContext\(context\s*=>\s*{([^}]+)}\)/g, async (match, [contextAccessor]) => {
                const result = (new Function("scope", `with(scope){ return ${contextAccessor}; }`))({ context: atomContext });
                if (result && result.constructor === Promise) {
                    return stringify(await result);
                }
                return stringify(result);
            });
        }
        return responseText;
    }

    /**
     * Executes the content of the atom
     * @param {BaseScriptHelper} scriptHelper script helper
     * @param {Object|BaseScriptHelperExports.ExecuteOption} options options
     * @param {String} path atom name
     * @param {...Object} args arguments to call the atom function
     * @returns {Promise<Object>}
     */
    static async ExecuteAsync(scriptHelper, options, path, ...args) {
        return this.ExecuteInFrameAsync(null, scriptHelper, options, path, ...args);
    }

    /**
     * Executes the content of the atom
     * @param {String} [frameId] "#frameId" or "/frame/url"
     * @param {BaseScriptHelper} scriptHelper script helper
     * @param {Object|BaseScriptHelperExports.ExecuteOption} options options
     * @param {String} path atom name
     * @param {...Object} args arguments to call the atom function
     * @returns {Promise<Object>}
     */
    static async ExecuteInFrameAsync(frameId, scriptHelper, options, path, ...args) {
        const atomContext = new AtomExecutionContext();
        atomContext.options = options;
        const name = path.match(/[^/]+$/)[0];
        return scriptHelper.executeScriptAsync(`
            ${await this.GetAtomAsync(name, path, atomContext)}
            return ${name.includes("async") ? "await " : ""}${name}(${args.map(stringify).join(", ")});`, { frameId: frameId });
    }
}