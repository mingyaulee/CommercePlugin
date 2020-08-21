import helper from "../helper.js";

const scHelper = (function () {
    const clickButton = (buttonElement) => {
        if (buttonElement.prop("onclick")) {
            const sender = buttonElement.elements[0];
            const offset = buttonElement.offset();
            const x = offset.left;
            const y = offset.top;
            const clickEvent = {
                clientX: x,
                clientY: y,
                toElement: sender,
                target: sender,
                srcElement: sender,
                which: 1,
                type: "click",
                isDefaultPrevented: false,
                stopPropagation: () => { },
                preventDefault: () => { clickEvent.isDefaultPrevented = true; }
            };
            window["scForm"].lastEvent = clickEvent;
            buttonElement.prop("onclick").apply(sender, [clickEvent]);
        } else {
            buttonElement.click();
        }
    };

    /**
     * Waits for jQuery and Sitecore ajax calls to be completed
     * @returns {Promise}
     */
    const waitForAjaxAsync = () => helper.waitForConditionAsync(() => {
        let ajaxCount = 0;
        if (window["jQuery"]) {
            ajaxCount += window["jQuery"].active;
        }
        if (window["scForm"] && window["scForm"].requests) {
            ajaxCount += window["scForm"].requests.length;
        }
        if (window["Ajax"]) {
            ajaxCount += window["Ajax"].activeRequestCount;
        }
        return ajaxCount === 0;
    }, { delayMs: 500, pollMs: 1000 });

    /**
     * Waits for popup to be loaded
     * @returns {Promise}
     */
    const waitForPopupAsync = () => helper.waitForConditionAsync(() => {
        const popupFrame = /** @type {HTMLFrameElement} */ (document.getElementById("jqueryModalDialogsFrame"));
        if (popupFrame) {
            const iFrames = popupFrame.contentWindow.document.getElementsByTagName("iframe");
            if (!iFrames.length) {
                return false;
            }
            for (const iFrame of iFrames) {
                if (iFrame.contentWindow.document.readyState !== "complete" || iFrame.parentElement.style.opacity !== "1") {
                    return false;
                }
            }
        } else {
            return false;
        }
        return true;
    }, { delayMs: 1000, pollMs: 1000 });

    const contentEditor = (() => {
        const ribbon = {
            getTab: (tabName) => {
                tabName = tabName.toUpperCase();
                const tabElement = helper.queryElement("#ContentEditorForm #RibbonPanel .scRibbonNavigatorButtonsGroupButtons")
                    .children()
                    .filter(tabElement => tabElement.text().toUpperCase() === tabName);

                if (tabElement.length === 0) {
                    throw new Error("Ribbon tab is not found (" + tabName + ")");
                }

                if (tabElement.hasClass("scRibbonNavigatorButtonsActive") === false) {
                    tabElement.click();
                }

                return {
                    tabElement: tabElement,
                    getButton: (buttonName) => {
                        buttonName = buttonName.toUpperCase();
                        const buttonElement = helper.queryElement("#ContentEditorForm #RibbonPanel .scRibbonToolbarStrip")
                            .filter(toolbarStrip => toolbarStrip.visible())
                            .find(".chunk > .panel")
                            .find(".scRibbonToolbarLargeButton, .scRibbonToolbarSmallButton, .scRibbonToolbarLargeGalleryButton, .scRibbonToolbarSmallGalleryButton, .scRibbonToolbarLargeComboButton, .scRibbonToolbarSmallComboButton")
                            .filter(buttonElement => buttonElement.find(".header").text().toUpperCase() === buttonName);

                        if (buttonElement.length === 0) {
                            throw new Error("Button is not found in ribbon tab (" + buttonName + ")");
                        }

                        const button = {
                            buttonElement: buttonElement,
                            clickAsync: () => {
                                if (buttonElement.is("a") === false) {
                                    clickButton(buttonElement.find("a:first-child"));
                                } else {
                                    clickButton(buttonElement);
                                }
                                return waitForAjaxAsync();
                            }
                        };

                        if (buttonElement.is(".scRibbonToolbarLargeGalleryButton, .scRibbonToolbarSmallGalleryButton, .scRibbonToolbarLargeComboButton, .scRibbonToolbarSmallComboButton")) {
                            button.expandAsync = async () => {
                                const expandButton = buttonElement.is(".scRibbonToolbarLargeComboButton, .scRibbonToolbarSmallComboButton") ? buttonElement.find(".scRibbonToolbarLargeComboButtonBottom, .scRibbonToolbarSmallComboButtonRight") : buttonElement;
                                clickButton(expandButton);
                                await waitForAjaxAsync();

                                const containerElement = helper.queryElement("div[data-openerid='" + expandButton.prop("id") + "'], iframe#" + expandButton.prop("id") + "_frame");
                                const expandedButton = {
                                    containerElement: containerElement
                                };

                                if (containerElement.is("div.scPopup")) {
                                    expandedButton.getButton = (buttonName) => {
                                        buttonName = buttonName.toUpperCase();
                                        const buttonElement = containerElement.find("tr").filter(buttonElement => buttonElement.children("td.scMenuItemCaption").text().toUpperCase() === buttonName);

                                        if (buttonElement.length === 0) {
                                            throw new Error("Button is not found in the popup (" + buttonName + ")");
                                        }

                                        return {
                                            buttonElement: buttonElement,
                                            clickAsync: () => {
                                                clickButton(buttonElement);
                                                return waitForAjaxAsync();
                                            }
                                        };
                                    };
                                }
                                return expandedButton;
                            };
                        }

                        return button;
                    }
                };
            }
        };
        const getContentTabAsync =async () => {
            const contentTabElement = helper.queryElement("#ContentEditorForm #ContentEditor #EditorTabs")
                .children()
                .filter(tab => tab.text().toUpperCase() === "CONTENT");

            if (contentTabElement.length === 0) {
                throw new Error("Content tab is not found in Content Editor");
            }

            if (contentTabElement.find(".scEditorTabHeaderActive").length === 0) {
                contentTabElement.click();
                await waitForAjaxAsync();
            }

            const contentTabId = contentTabElement.prop("id");
            const getContentFrameElement = () => helper.queryElement("#ContentEditorForm #ContentEditor #EditorFrames #F" + contentTabId.substring(1));
            return {
                contentTabElement: contentTabElement,
                get contentFrameElement() {
                    return getContentFrameElement();
                },
                getSectionAsync: async (sectionName) => {
                    sectionName = sectionName.toUpperCase();
                    const getSectionElement = () => getContentFrameElement()
                        .find(".scEditorSectionCaptionExpanded, .scEditorSectionCaptionCollapsed")
                        .filter(sectionElement => sectionElement.text().toUpperCase() === sectionName);

                    const sectionElement = getSectionElement();

                    if (sectionElement.length === 0) {
                        throw new Error("Section is not found in Content Tab (" + sectionName + ")");
                    }

                    if (sectionElement.hasClass("scEditorSectionCaptionExpanded") === false) {
                        sectionElement.click();
                        await waitForAjaxAsync();
                    }

                    return {
                        get sectionHeaderElement() {
                            return getSectionElement();
                        },
                        get sectionFieldsElement() {
                            return getSectionElement().next();
                        },
                        getField: (fieldName) => {
                            fieldName = fieldName.toUpperCase();
                            const fieldElement = getSectionElement().next()
                                .find(".scEditorSectionPanelCell .scEditorFieldMarkerInputCell")
                                .filter(fieldElement => fieldElement.children(".scEditorFieldLabel").contents().first().text().toUpperCase() === fieldName);

                            if (fieldElement.length === 0) {
                                throw new Error("Field is not found in section (" + fieldName + ")");
                            }

                            const getFieldValueElement = () => {
                                return fieldElement.find("input.scContentControl, input.scComboboxEdit, select.scCombobox, select.scContentControlMultilistBox");
                            };

                            const field = {
                                fieldElement: fieldElement,
                                get fieldValueElement() {
                                    return getFieldValueElement();
                                }
                            };

                            const fieldValueElement = field.fieldValueElement;
                            if (fieldValueElement.is("input")) {
                                field.getValue = () => getFieldValueElement().val();
                                field.setValue = (value) => getFieldValueElement().val(value);
                            } else if (fieldValueElement.is("select.scCombobox")) {
                                field.getSelectedValueElement = () => getFieldValueElement().find("option[selected]");
                                field.getSelectedValue = () => field.getSelectedValueElement().prop("value");
                                field.getSelectedText = () => field.getSelectedValueElement().text();
                                field.setSelectedValue = (value) => getFieldValueElement().val(value);
                                field.setSelectedText = (value) => {
                                    value = value.toUpperCase();
                                    const valueElement = getFieldValueElement().find("option").filter(valueElement => valueElement.text().toUpperCase() === value);
                                    if (valueElement.length === 0) {
                                        throw new Error("Option is not found in the select dropdown (" + value + ")");
                                    }

                                    getFieldValueElement().val(valueElement.prop("value"));
                                };
                                field.clear = () => getFieldValueElement().val("");
                            } else if (fieldValueElement.is("select.scContentControlMultilistBox")) {
                                field.getSelectedValueElement = () => getFieldValueElement().children();
                                field.getSelectedValue = () => field.getSelectedValueElement().map(valueElement => valueElement.prop("value"));
                                field.getSelectedText = () => field.getSelectedValueElement().map(valueElement => valueElement.text());
                                field.clear = () => getFieldValueElement().children().trigger("dblclick");
                            }

                            return field;
                        }
                    };
                }
            };
        };
        const searchItemAsync = async (search) => {
            const searchInput =/** @type {HTMLInputElement} */ (document.getElementById("TreeSearch"));
            searchInput.value = search;
            helper.queryElement("#ContentEditorForm #SearchPanel .scSearchButton").click();
            return helper.waitForConditionAsync(() => {
                const selectedItemId = helper.queryElement("#ContentEditorForm #SearchResult a.scSearchLink:first-child").data("itemId");
                const contentFrame = helper.queryElement("#ContentEditorForm #ContentEditor #FContent" + selectedItemId.replace(/[^0-9a-z]/gi, ""));
                return contentFrame.length === 1;
            });
        };
        return {
            ribbon: ribbon,
            getContentTabAsync: getContentTabAsync,
            searchItemAsync: searchItemAsync
        }
    })();

    return {
        waitForAjaxAsync: waitForAjaxAsync,
        waitForPopupAsync: waitForPopupAsync,
        contentEditor: contentEditor
    };
})();

export default scHelper;