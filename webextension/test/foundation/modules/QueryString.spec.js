import QueryString from "../../../src/Scripts/foundation/modules/QueryString.js";

describe("QueryString.js", () => {
    
    describe("Parse", () => {

        it("should parse simple query string", () => {
            // arrange
            const expectedSearch = "test";
            const expectedPage = "1";

            // act
            const query = QueryString.Parse(`search=${expectedSearch}&page=${expectedPage}`);

            // assert
            expect(query["search"].toString()).toBe(expectedSearch);
            expect(query["page"].toString()).toBe(expectedPage);
        });

        it("should parse simple query string case insensitive", () => {
            // arrange
            const expectedSearch = "test";
            const expectedPage = "1";

            // act
            const query = QueryString.Parse(`SEARCH=${expectedSearch}&page=${expectedPage}`);

            // assert
            expect(query["search"].toString()).toBe(expectedSearch);
            expect(query["PAGE"].toString()).toBe(expectedPage);
        });
        
        it("should parse base64 encoded query string", () => {
            // arrange
            const encodedSearch = btoa("test");
            const expectedSearch = "test";
            const expectedPage = "1";

            // act
            const query = QueryString.Parse(`search=${encodedSearch}&page=${expectedPage}`);

            // assert
            expect(query["search"].toString()).toBe(encodedSearch);
            const decodedSearch = atob(query["search"].toString());
            expect(decodedSearch).toBe(expectedSearch);
            expect(query["page"].toString()).toBe(expectedPage);
        });

        it("should parse URL encoded query string value", () => {
            // arrange
            const encodedSearch = "test%20abc";
            const expectedSearch = "test abc";
            const expectedPage = "1";

            // act
            const query = QueryString.Parse(`search=${encodedSearch}&page=${expectedPage}`);

            // assert
            expect(query["search"].toString()).toBe(expectedSearch);
            expect(query["page"].toString()).toBe(expectedPage);
        });

        it("should parse repeated query string key", () => {
            // arrange
            const expectedValues = ["test", "abc"];

            // act
            const query = QueryString.Parse("key=test&key=abc");

            // assert
            const actualValues = query["key"];
            expect(actualValues).toEqual(expectedValues);
        });

        it("should parse repeated query string key case insensitive", () => {
            // arrange
            const expectedValues = ["test", "abc"];

            // act
            const query = QueryString.Parse("key=test&KEY=abc");

            // assert
            const actualValues = query["key"];
            expect(actualValues).toEqual(expectedValues);
        });

    });

});
