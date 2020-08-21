import CommonHelper from "../../../src/Scripts/foundation/helpers/CommonHelper.js";

describe("CommonHelper.js", () => {

    describe("waitFor()", () => {

        it("should wait for the specified time", async () => {
            // arrange
            const waitTimeMs = 1000;
            const timeBeforeWait = new Date().getTime();

            // act
            await CommonHelper.waitFor(waitTimeMs);

            // assert
            const timeAfterWait = new Date().getTime();
            expect(timeAfterWait).toBeGreaterThanOrEqual(timeBeforeWait + waitTimeMs);
        });

    });

    describe("guid()", () => {

        it("should generate random guid", () => {
            // arrange
            const expectedFormat = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;

            // act
            const guid1 = CommonHelper.guid();
            const guid2 = CommonHelper.guid();

            // assert
            expect(guid1).not.toBe(guid2);
            expect(guid1).toMatch(expectedFormat);
        });

    });

});