import helper from "../../helper.js";

export default (publishOption) => {
    publishOption = {
        incrementalPublish: false,
        smartPublish: false,
        republish: false,
        allLanguage: false,
        languages: ["English"],
        ...publishOption
    };

    if (publishOption.incrementalPublish) {
        helper.queryElement("#IncrementalPublish").click();
    } else if (publishOption.republish) {
        helper.queryElement("#Republish").click();
    } else {
        helper.queryElement("#SmartPublish").click();
    }

    if (publishOption.allLanguage) {
        const allLanguagesCheckbox = helper.queryElement("#Languages #SelectAllLanguages");
        if (allLanguagesCheckbox.prop("checked") === false) {
            allLanguagesCheckbox.click();
        }
    } else if (publishOption.languages) {
        helper.queryElement("#Languages").find("input").each(languageCheckbox => {
            const languageName = languageCheckbox.next().text();
            if (publishOption.languages.includes(languageName)) {
                if (languageCheckbox.prop("checked") === false) {
                    languageCheckbox.click();
                }
            } else {
                if (languageCheckbox.prop("checked") === true) {
                    languageCheckbox.click();
                }
            }
        });
    }

    helper.queryElement("#NextButton").click();
}