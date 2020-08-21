import StringHelper from "../../../src/Scripts/foundation/helpers/StringHelper.js";

describe("StringHelper.js", () => {

    describe("formatTemplate()", () => {

        it("should return formatted template with matching property in object", () => {
            // arrange
            const template = "This is a {template}";
            const dictionary = {
                template: "formatted template"
            };
            const expectedResult = "This is a formatted template";

            // act
            const actualResult = StringHelper.formatTemplate(template, dictionary);

            // assert
            expect(actualResult).toBe(expectedResult);
        });

        it("should return unformatted template without matching property in object", () => {
            // arrange
            const template = "This is a {template}";
            const dictionary = {};
            const expectedResult = template;

            // act
            const actualResult = StringHelper.formatTemplate(template, dictionary);

            // assert
            expect(actualResult).toBe(expectedResult);
        });

    });

    describe("replaceAsync()", () => {

        it("should replace the matches with text from the replacer function", async () => {
            // arrange
            const text = "This is a {template}";
            const pattern = /{(.+)}/g;
            const replacer = async (match, matchGroups) => {
                return "text";
            };
            const expectedResult = "This is a text";

            // act
            const actualResult = await StringHelper.replaceAsync(text, pattern, replacer);

            // assert
            expect(actualResult).toBe(expectedResult);
        });

    });

});