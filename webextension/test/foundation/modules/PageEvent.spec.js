import Setup from "../../TestSetup.js";
import PageEvent from "../../../src/Scripts/foundation/modules/PageEvent.js";

describe("PageEvent.js", () => {
    
    Setup();

    describe("generic event", () => {

        it("should have generic type", () => {
            // arrange
            const pageEvent = new PageEvent("generic", "10256");
            const expectedType = "generic";

            // act
            const type = pageEvent.type;

            // assert
            expect(type).toBe(expectedType);
        });

    });

    describe("duplicate object", () => {

        it("should be equal", () => {
            // arrange
            const object1 = new PageEvent("generic", 123);
            const object2 = new PageEvent("generic", 123);

            // act
            const result = object1.equals(object2);

            // assert
            expect(result).toBeTrue();
        });

    });

});