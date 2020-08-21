/**
 * Simple Types
 * - Boolean
 *     Example:
 *       {
 *         type: Boolean,
 *         name: "Enable automation",
 *         value: true
 *       }
 * 
 * - Number
 *     Additional properties:
 *       min (optional) - minimum value of the numeric input
 *       max (optional) - maximum value of the numeric input
 *       step (optional) - step value of the numeric input (when the spinner is clicked)
 *     Example:
 *       {
 *         type: Number,
 *         name: "Default timeout (ms)",
 *         value: 1000
 *       }
 *     Example:
 *       {
 *         type: Number,
 *         name: "Percentage",
 *         value: 80,
 *         min: 0,
 *         max: 100,
 *         step: 5
 *       }
 * 
 * - String
 *     Example:
 *       {
 *         type: String,
 *         name: "Redirect URL",
 *         value: "https://xxx.com"
 *       }
 * 
 * Complex Types
 * - Object
 *     Used to nest other simple types or complex types.
 *     Example:
 *       {
 *         type: Object,
 *         name: "Section 1",
 *         value: {
 *           SectionProperty: {
 *             type: String,
 *             name: "Section 1 property",
 *             value: "Property value"
 *           },
 *           Subsection: {
 *             type: Object,
 *             name: "Section 1 subsection"
 *             value: {
 *               SubsectionProperty: {
 *                 type: Number,
 *                 name: "Subsection property",
 *                 value: 123
 *               }
 *             }
 *           }
 *         }
 *       }
 * 
 * - Array
 *     Used to manage list type configuration values.
 *     Usually used with Symbol type (see Symbol section below).
 *     Additional properties:
 *       schema (required) - contains the object type of the array, which could be any other type, along with their default value
 *     Note:
 *       The value property is always an array containing objects with name and value property.
 *     Example:
 *       {
 *         type: Array,
 *         name: "List of product IDs",
 *         schema: {
 *           type: Number,
 *           value: 0
 *         },
 *         value: [
 *           {
 *             name: "Product 1",
 *             value: 1000
 *           },
 *           {
 *             name: "Product 2",
 *             value: 1001
 *           }
 *         ]
 *       }
 *     Example:
 *       {
 *         type: Array,
 *         name: "Address list",
 *         schema: {
 *           type: Object,
 *           value: {
 *             AddressLine: {
 *               type: String,
 *               name: "Address line",
 *               value: ""
 *             },
 *             Postcode: {
 *               type: Number,
 *               name: "Postal code",
 *               value: 0
 *             }
 *           }
 *         },
 *         value: [
 *           {
 *             name: "Address 1",
 *             value: {
 *               AddressLine: {
 *                 value: "My address line"
 *               },
 *               Postcode: {
 *                 value: 2405
 *               }
 *             }
 *           }
 *         ]
 *       }
 * 
 * - Symbol
 *     Used to select from a list type configuration values.
 *     MUST be used with Array type (see Array section above).
 *     Additional properties:
 *       datasource (required) - contains the property path relative to the root, separated by "/", where the object type at the path is Array type.
 *     Note:
 *       The default empty value is "-" to prevent conflict with empty value of String type.
 *       The non-empty value will reference to the option object with the exact name property in the array.
 *     Example:
 *       {
 *         type: Symbol,
 *         name: "Product ID",
 *         datasource: "Section1/ProductIdList",
 *         value: "Product 1"
 *       }
 *     Example:
 *       {
 *         type: Symbol,
 *         name: "Address for shipping",
 *         datasource: "Section1/Subsection/AddressList",
 *         value: "-"
 *       }
 */
export default {
	type: Object,
	name: "Root",
	value: {
		Common: {
			type: Object,
			name: "Common Options",
			value: {
				NodeServerUrl: {
					type: String,
					name: "Node Server Url",
					value: "http://localhost:8088"
				},
				NotificationTimeout: {
					type: Number,
					name: "Notification Timeout (ms)",
					value: 5000
				},
				Debug: {
					type: Boolean,
					name: "Debug mode",
					value: false
				}
			}
		},
		TFS: {
			type: Object,
			name: "TFS Options",
			value: {
				Url: {
					type: String,
					name: "TFS Url (Regex)",
					value: "https?://tfs4dk1(\\.dk\\.sitecore\\.net)?/"
				}
			}
		},
		Automations: {
			type: Object,
			name: "Automation Options",
			value: {
				TimeoutMs: {
					type: Number,
					name: "Timeout (ms)",
					value: 60000,
					min: 0,
					step: 1000
				},
				LoginCredentials: {
					type: Array,
					name: "Login credentials",
					schema: {
						type: Object,
						value: {
							Username: {
								type: String,
								name: "Username",
								value: ""
							},
							Password: {
								type: String,
								name: "Password",
								value: "",
							}
						}
					},
					value: [
						{
							name: "Sitecore",
							value: {
								Username: {
									value: "admin"
								},
								Password: {
									value: "b"
								}
							}
						}
					]
				},
				Sitecore: {
					type: Object,
					name: "Sitecore Automation",
					value: {
						LoginUrl: {
							type: String,
							name: "Login URL (token: host)",
							value: "https://{host}/sitecore/shell/sitecore/client/Applications/Launchpad"
						},
						ContentEditorUrl: {
							type: String,
							name: "Content editor URL (token: host)",
							value: "https://{host}/sitecore/shell/Applications/Content%20Editor.aspx?sc_bw=1"
						},
						LoginCredential: {
							type: Object,
							name: "Sitecore Login",
							value: {
								OnPrem: {
									type: Symbol,
									name: "On Premise",
									datasource: "Automations/LoginCredentials",
									value: "Sitecore"
								},
								Azure: {
									type: Symbol,
									name: "Azure instance",
									datasource: "Automations/LoginCredentials",
									value: "Sitecore"
								}
							}
						}
					}
				}
			}
		}
	}
}