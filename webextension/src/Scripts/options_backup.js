import ExtensionHelper from "./foundation/helpers/ExtensionHelper.js";
import DefaultOption from "./foundation/DefaultOption.js";
import FeatureEvents from "./features/FeatureEvents.js";
import LogHelper from "./foundation/helpers/LogHelper.js";

const name = "options";

const state = {
	options: null,
	trackedOptions: null
};

function saveOptions() {
	globalThis.browser.storage.sync.set(state.trackedOptions)
		.then(() => {
			const status = globalThis.document.getElementById("status");
			status.classList.remove("d-none");
			globalThis.setTimeout(function () {
				status.classList.add("d-none");
			}, 750);
			ExtensionHelper.sendMessageAsync({
				eventName: FeatureEvents.Option.Updated
			});
			restoreOptionsAsync();
		});
}

export function getOptionNodeByPropertyPath(options, propertyPath, createProperty = false) {
	while (true) {
		let currentProperty = propertyPath;
		if (propertyPath.indexOf("/") > -1) {
			currentProperty = propertyPath.substring(0, propertyPath.indexOf("/"));
		}
		if (!options.hasOwnProperty(currentProperty)) {
			if (createProperty) {
				options[currentProperty] = { value: currentProperty === propertyPath ? null : {} };
			} else {
				return null;
			}
		}
		if (currentProperty === propertyPath) {
			return {
				node: options,
				key: propertyPath,
				value: options[propertyPath].value
			};
		} else {
			options = options[currentProperty].value;
			propertyPath = propertyPath.substring(currentProperty.length + 1);
		}
	}
}

function getOptionValue(options, propertyPath) {
	return getOptionNodeByPropertyPath(options.value, propertyPath).value;
}

function setOptionValue(options, propertyPath, value) {
	const optionNode = getOptionNodeByPropertyPath(options.value, propertyPath, true);
	optionNode.node[optionNode.key].value = value;
}

export function removeOptionNodeByPropertyPath(options, propertyPath, checkIfEmpty = false) {
	const optionNode = getOptionNodeByPropertyPath(options, propertyPath);
	if (optionNode !== null) {
		if (!checkIfEmpty || Object.keys(optionNode.node[optionNode.key].value).length === 0) {
			delete optionNode.node[optionNode.key];

			propertyPath = propertyPath.substring(0, propertyPath.length - optionNode.key.length - 1);
			if (propertyPath !== "") {
				removeOptionNodeByPropertyPath(options, propertyPath, true);
			}
		}
	}
}

function getInputFromOptionElement(element) {
	const inputElement = element.querySelector("input, select, textarea");
	const input = {
		element: inputElement,
		getValue: () => inputElement.value,
		setValue: (value) => inputElement.value = value,
		setPlaceholder: (placeholder) => inputElement.placeholder = placeholder
	};

	if (inputElement.getAttribute("type") === "checkbox") {
		input.getValue = () => inputElement.checked;
		input.setValue = (value) => inputElement.checked = !!value;
		input.setPlaceholder = (placeholder) => placeholder;
	}

	return input;
}

function getOptionElementFromInputElement(element) {
	while (!element.getAttribute("data-bind")) {
		element = element.parentElement;
	}
	return element;
}

function updateDataBinding(event) {
	const element = getOptionElementFromInputElement(event.target);
	const propertyPath = element.getAttribute("data-bind");
	const input = getInputFromOptionElement(element);
	const currentOptionValue = input.getValue();
	const storeOptionValue = getOptionValue(state.options, propertyPath);
	const defaultOptionValue = getOptionValue(DefaultOption, propertyPath);

	if (currentOptionValue === storeOptionValue || (currentOptionValue === "" && storeOptionValue === defaultOptionValue)) {
		element.classList.remove("modified-value");
	} else {
		element.classList.add("modified-value");
	}

	if (currentOptionValue !== defaultOptionValue && currentOptionValue !== "") {
		element.classList.remove("default-value");
		setOptionValue(state.trackedOptions, propertyPath, currentOptionValue);
	} else {
		element.classList.add("default-value");
		removeOptionNodeByPropertyPath(state.trackedOptions.value, propertyPath);
	}
	LogHelper.log(JSON.stringify(state.trackedOptions));
}

function bindElementData(element) {
	const propertyPath = element.getAttribute("data-bind");
	const currentOptionValue = getOptionValue(state.options, propertyPath);
	const defaultOptionValue = getOptionValue(DefaultOption, propertyPath);
	if (currentOptionValue !== defaultOptionValue) {
		setOptionValue(state.trackedOptions, propertyPath, currentOptionValue);
	} else {
		element.classList.add("default-value");
	}
	const input = getInputFromOptionElement(element);
	input.setValue(currentOptionValue);
	input.setPlaceholder(defaultOptionValue);
	input.element.addEventListener("input", updateDataBinding);
}

function setupStringInput(element, options, propertyPath) {
	const inputGroup = globalThis.document.createElement("div");
	const formGroup = globalThis.document.createElement("div");
	const label = globalThis.document.createElement("label");
	const labelText = globalThis.document.createElement("span");
	const defaultValueText = globalThis.document.createElement("span");
	const input = globalThis.document.createElement("input");

	element.appendChild(inputGroup);
	inputGroup.appendChild(formGroup);
	formGroup.appendChild(label);
	formGroup.appendChild(input);
	label.appendChild(labelText);
	label.appendChild(defaultValueText);

	inputGroup.className = "input-group";
	inputGroup.setAttribute("data-bind", propertyPath);
	formGroup.className = "form-group w-100";
	label.className = "form-check-label";
	labelText.innerText = options.name;
	defaultValueText.innerText = "(default value)";
	defaultValueText.className = "default-value-text";
	input.className = "form-control";
	return inputGroup;
}

function setupNumberInput(element, options, propertyPath) {
	const inputGroup = globalThis.document.createElement("div");
	const formGroup = globalThis.document.createElement("div");
	const label = globalThis.document.createElement("label");
	const labelText = globalThis.document.createElement("span");
	const defaultValueText = globalThis.document.createElement("span");
	const input = globalThis.document.createElement("input");

	element.appendChild(inputGroup);
	inputGroup.appendChild(formGroup);
	formGroup.appendChild(label);
	formGroup.appendChild(input);
	label.appendChild(labelText);
	label.appendChild(defaultValueText);

	inputGroup.className = "input-group";
	inputGroup.setAttribute("data-bind", propertyPath);
	formGroup.className = "form-group w-100";
	label.className = "form-check-label";
	labelText.innerText = options.name;
	defaultValueText.innerText = "(default value)";
	defaultValueText.className = "default-value-text";
	input.className = "form-control";
	input.type = "number";
	if (options.min) {
		input.min = options.min;
	}
	if (options.max) {
		input.max = options.max;
	}
	if (options.step) {
		input.step = options.step;
	}
	return inputGroup;
}

function setupBooleanInput(element, options, propertyPath) {
	const inputGroup = globalThis.document.createElement("div");
	const formCheck = globalThis.document.createElement("div");
	const label = globalThis.document.createElement("label");
	const labelText = globalThis.document.createElement("span");
	const defaultValueText = globalThis.document.createElement("span");
	const input = globalThis.document.createElement("input");

	element.appendChild(inputGroup);
	inputGroup.appendChild(formCheck);
	formCheck.appendChild(label);
	label.appendChild(input);
	label.appendChild(labelText);
	label.appendChild(defaultValueText);

	inputGroup.className = "input-group";
	inputGroup.setAttribute("data-bind", propertyPath);
	formCheck.className = "form-check w-100";
	label.className = "form-check-label";
	labelText.innerText = options.name;
	defaultValueText.innerText = "(default)";
	defaultValueText.className = "default-value-text";
	input.className = "form-check-input";
	input.type = "checkbox";
	return inputGroup;
}

function renderOptions(element, options, propertyPath = null) {
	if (options.type === Object) {
		let sectionBody = element;

		if (propertyPath !== null) {
			const sectionGroup = globalThis.document.createElement("div");
			const sectionHeader = globalThis.document.createElement("div");
			sectionBody = globalThis.document.createElement("div");

			element.appendChild(sectionGroup);
			sectionGroup.appendChild(sectionHeader);
			sectionGroup.appendChild(sectionBody);
			sectionHeader.innerText = options.name;

			if (propertyPath.indexOf("/") === -1) {
				sectionGroup.className = "card mb-4";
				sectionHeader.className = "card-header font-weight-bold";
				sectionBody.className = "card-body";
			} else {
				sectionGroup.className = "option-section-group";
				sectionHeader.className = "option-section-header font-weight-bold pb-1";
				sectionBody.className = "option-section-body px-3";
			}
		}

		Object.keys(options.value).forEach(property => renderOptions(sectionBody, options.value[property], (propertyPath ? propertyPath + "/" : "") + property));
	} else if (options.type === String) {
		const inputGroup = setupStringInput(element, options, propertyPath);
		bindElementData(inputGroup);
	} else if (options.type === Boolean) {
		const inputGroup = setupBooleanInput(element, options, propertyPath);
		bindElementData(inputGroup);
	} else if (options.type === Number) {
		const inputGroup = setupNumberInput(element, options, propertyPath);
		bindElementData(inputGroup);
	}
}

async function restoreOptionsAsync() {
	state.options = await ExtensionHelper.getOptionsAsync();
	state.trackedOptions = { value: {} };

	const container = globalThis.document.getElementById("container");

	while (container.children.length) {
		container.children[0].remove();
	}

	renderOptions(container, state.options);
}

function addElementOnClick(elementId, onClick) {
	const element = globalThis.document.getElementById(elementId);
	if (element) {
		element.addEventListener("click", onClick);
	}
}

function initialize() {
	if (globalThis.document) {
		globalThis.document.title = ExtensionHelper.getExtensionName();
	}
	addElementOnClick("save", saveOptions);
	restoreOptionsAsync();
}

globalThis.debugScript = () => {
	console.log("debug");
};

globalThis.document.addEventListener("DOMContentLoaded", initialize);
