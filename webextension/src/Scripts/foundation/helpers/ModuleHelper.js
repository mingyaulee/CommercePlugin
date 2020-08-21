import StringHelper from "./StringHelper.js";

/**
 * Gets the content of the script to import
 * @param {String} url script url
 * @returns {Promise<String>}
 */
async function getAsync(url) {
    const response = await fetch(url);
    return await response.text();
}

/**
 * Gets the import name from the import path
 * @param {String} importPath import path
 * @returns {String}
 */
function getImportNameFromPath(importPath) {
    return "import_" + importPath.match(/([^\/])+$/)[0].replace(/\W/g, "_");
}

/**
 * Transpile the module exports into assignment statement
 * @param {Boolean} moduleExportDefault module export default
 * @param {String} moduleExportType module export type
 * @param {String} moduleExportName module export name
 * @returns {String}
 */
function transpileModuleExports(moduleExportDefault, moduleExportType, moduleExportName) {
    //     Initial state                            Final state
    // 1.  export async function name               let name = exports.name = async function
    // 1a. export default async function name       let name = exports.default = async function
    // 2.  export function name                     let name = exports.name = function
    // 2a. export default function name             let name = exports.default = function
    // 3.  export class name                        let name = exports.name = class
    // 3a. export default class name                let name = exports.default = class
    // 4.  export const name                        let name = exports.name
    // 4a. export default const name                let name = exports.default
    // 5.  export var name                          let name = exports.name
    // 5a. export default var name                  let name = exports.default
    // 6.  export name                              exports.name = name
    // 6a. export default name                      exports.default = name
    // 7.  export default async                     exports.default = async
    // 8.  export default                           exports.default =
    if (moduleExportDefault && !moduleExportType && !moduleExportName) { // case 8
        return "exports.default = ";
    } else if (!moduleExportType) { // case 6
        return `exports.${moduleExportDefault ? "default" : moduleExportName} = ${moduleExportName}`;
    } else if (moduleExportDefault && !moduleExportName) { // case 7
        return `exports.default = ${moduleExportType}`;
    }
    if (moduleExportType === "const" || moduleExportType === "var") { // case 4 & 5
        return `let ${moduleExportName} = exports.${moduleExportDefault ? "default" : moduleExportName}`;
    }
    // case 1 & 2 & 3
    return `let ${moduleExportName} = exports.${moduleExportDefault ? "default" : moduleExportName} = ${moduleExportType}`;
}

/**
 * Transpile the module imports into array of mapping assignment statements
 * @param {String} moduleImports module imports
 * @param {String} importModuleName import module name
 * @returns {String[]}
 */
function transpileModuleImports(moduleImports, importModuleName) {
    //    Initial state                 Intermediate state              Final state
    // 1. module1                       from: default   to: module1     let module1 = importModuleName.default;
    // 2. module1 inside bracket        from: module1   to: module1     let module1 = importModuleName.module1;
    // 3. * as m1                       from: null      to: m1          let m1 = importModuleName;
    // 4. module1 as m1                 from: default   to: m1          let m1 = importModuleName.default;
    // 5. module1 as m1 inside bracket  from: module1   to: m1          let m1 = importModuleName.module1;
    const moduleImportMappings = [];
    let inBrackets = false;
    moduleImports.split(",").forEach(splitString => {
        const alias = splitString.replace(/[{}]/g, "");
        if (splitString.includes("{")) {
            inBrackets = true;
        }

        const [, imported, , importedAlias] = alias.match(/(\w+|\*)\s*(as\s+(\w+))?/);
        const mapping = {};

        if (importedAlias) {
            mapping.to = importedAlias;
        } else {
            mapping.to = imported;
        }

        if (inBrackets) {
            mapping.from = imported;
        } else if (imported === "*") {
            mapping.from = null;
        } else {
            mapping.from = "default";
        }

        if (splitString.includes("}")) {
            inBrackets = false;
        }

        moduleImportMappings.push(mapping);
    });
    return moduleImportMappings.map(mapping => `let ${mapping.to} = ${importModuleName}${mapping.from ? `.${mapping.from}` : ""};`);
}

/**
 * Resolves the import URL
 * @param {String} absolutePath content path
 * @param {String} relativePath import path
 */
function resolveImportUrl(absolutePath, relativePath) {
    absolutePath = absolutePath.substring(0, absolutePath.lastIndexOf("/") + 1);
    while (relativePath.startsWith(".") || relativePath.startsWith("/")) {
        if (relativePath[0] === ".") {
            absolutePath = absolutePath.substring(0, absolutePath.lastIndexOf("/"));
        } else if (relativePath[0] === "/") {
            absolutePath += "/";
        }
        relativePath = relativePath.substring(1);
    }
    return absolutePath + relativePath;
}

/**
 * Imported Module class
 */
class ImportedModule {
    /** @type {String} */
    Name;
    /** @type {String} */
    Url;
    /** @type {String} */
    Content;
    /** @type {String[]} */
    ImportedBy;

    /**
     * Creates a new instance of Imported Module class
     * @param {String} name module name
     * @param {String} url module url
     * @param {String} content module content
     * @param {String} importedBy imported by module name
     */
    constructor(name, url, content, importedBy) {
        this.Name = name;
        this.Url = url;
        this.Content = content;
        this.ImportedBy = [importedBy];
    }
}

/**
 * Import Branch class
 */
class ImportBranch {
    /** @type {String} */
    Name;
    /** @type {ImportBranch[]} */
    Imports;

    /**
     * Creates a new instance of Import Branch class
     * @param {String} name module name
     */
    constructor(name) {
        this.Name = name;
        this.Imports = [];
    }
}

/**
 * @typedef {Object} ImportContext
 * @property {Number} level
 * @property {ImportedModule[]} importedModules
 * @property {ImportBranch[]} importBranches
 * @property {ImportBranch} currentImportBranch
 * @property {String[]} currentImportedUrls
 */

/**
 * Module helper class
 */
export default class ModuleHelper {
    /**
     * Flatten module content
     * @param {String} scriptContent script content
     * @param {String} contentPath content path
     * @param {ImportContext} [importContext] imported paths
     * @returns {Promise<String>}
     */
    static async flattenModuleContentAsync(scriptContent, contentPath, importContext) {
        if (!importContext) {
            importContext = {
                level: 0,
                importedModules: [],
                importBranches: [],
                currentImportBranch: new ImportBranch("#Root"),
                currentImportedUrls: [contentPath]
            };
        }
        importContext.level++;
        const moduleContent = await StringHelper.replaceAsync(scriptContent, /^((import)\s+(.+)from\s+"(.+)"\s*;?)|^((export)\s+(default\s+)?(async\s+)?(function\s+|class\s+|const\s+|var\s+)?(\w+)?)/gm, async (match, matchGroups) => {
            if (matchGroups[1] === "import") {
                const [, , importNames, importPath] = matchGroups;
                const importUrl = resolveImportUrl(contentPath, importPath);

                if (importContext.currentImportedUrls.includes(importUrl)) {
                    throw new Error(`Circular reference detected between ${contentPath} and ${importUrl}`);
                }

                const importModuleName = getImportNameFromPath(importPath);
                let currentImportBranch = importContext.importBranches.find(importBranch => importBranch.Name === importModuleName);
                if (!currentImportBranch) {
                    currentImportBranch = new ImportBranch(importModuleName);
                    importContext.importBranches.push(currentImportBranch);
                }
                if (!importContext.currentImportBranch.Imports.includes(currentImportBranch)) {
                    importContext.currentImportBranch.Imports.push(currentImportBranch);
                }
                const innerImportContext = {
                    level: importContext.level,
                    importedModules: importContext.importedModules,
                    importBranches: importContext.importBranches,
                    currentImportBranch: currentImportBranch,
                    currentImportedUrls: [...importContext.currentImportedUrls, importUrl]
                };
                const transpiledModuleImports = transpileModuleImports(importNames, importModuleName);
                const importModuleContent = await getAsync(importUrl);
                const flattenedModuleContent = await this.flattenModuleContentAsync(importModuleContent, importUrl, innerImportContext);
                const existingImportedModule = importContext.importedModules.find(importedModule => importedModule.Name === importModuleName);
                if (!existingImportedModule) {
                    const importedModuleContent = `
//// Start Imported Module [${importModuleName}] [${importUrl}]
const ${importModuleName} = (() => {
    const exports = {};
    \n${flattenedModuleContent}
    return exports;
})();
//// End Imported Module [${importModuleName}]
                    `;
                    const importedModule = new ImportedModule(importModuleName, importUrl, importedModuleContent, importContext.currentImportBranch.Name);
                    importContext.importedModules.push(importedModule);
                } else if (!existingImportedModule.ImportedBy.includes(importContext.currentImportBranch.Name)) {
                    existingImportedModule.ImportedBy.push(importContext.currentImportBranch.Name);
                }
                return `//// Transpiled [${match}] to [${transpiledModuleImports.join("\\n")}]\n` +
                    transpiledModuleImports.join("\n");
            } else if (matchGroups[5] === "export") {
                const moduleExportDefault = !!matchGroups[6]?.trim();
                const moduleExportType = ((matchGroups[7] ?? "") + (matchGroups[8] ?? "")).trim();
                const moduleExportName = matchGroups[9]?.trim();
                const transpiledModuleExport = transpileModuleExports(moduleExportDefault, moduleExportType, moduleExportName);
                return `//// Tranpiled [${match}] to [${transpiledModuleExport}]\n` +
                    transpiledModuleExport;
            }
            return match;
        });

        if (importContext.level === 1) {
            function printBranch(/** @type {ImportBranch} */branch, leadingSpaces = "") {
                return [
                    leadingSpaces + "- " + branch.Name,
                    ...branch.Imports.map(importBranch => printBranch(importBranch, leadingSpaces + "  ")).flat()
                ];
            };
            return "\n" +
                // Import branch
                "//// Import branches\n" +
                printBranch(importContext.currentImportBranch).map(line => "//// " + line).join("\n") + "\n" +
                "\n" +
                // Imported modules
                importContext.importedModules
                    .map(importedModule => `//// Imported Module [${importedModule.Name}] Imported By [${importedModule.ImportedBy.join(", ")}]` +
                        importedModule.Content
                    ).join("\n") + "\n" +
                // Root module content
                moduleContent;
        }
        return moduleContent;
    }
}