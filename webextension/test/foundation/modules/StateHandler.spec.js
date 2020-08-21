import StateHandler from "../../../src/Scripts/foundation/modules/StateHandler.js";

describe("StateHandler.js", () => {

    describe("without default state", () => {

        it("should return undefined when no matching id is found", () => {
            // arrange
            const stateHandler = new StateHandler();

            // act
            const state = stateHandler.get(123);

            // assert
            expect(state).toBeUndefined();
        });

    });

    describe("with default state", () => {

        it("should return default state when no matching id is found", () => {
            // arrange
            const defaultState = { num: 1 };
            const stateHandler = new StateHandler(defaultState);

            // act
            const state = stateHandler.get(123);

            // assert
            expect(state).toBe(defaultState);
        });

        it("should create state with default as base", () => {
            // arrange
            const defaultState = { num: 1 };
            const stateHandler = new StateHandler(defaultState);

            // act
            stateHandler.update({ id: 10 });

            // assert
            const state = stateHandler.get(10);
            expect(state.id).toBe(10);
            expect(state.num).toBe(1);
        });

    });

    describe("creating state with id", () => {

        it("should get the created state", () => {
            // arrange
            const stateHandler = new StateHandler();

            // act
            stateHandler.update({ id: 11, property1: "Test", property2: 123, property3: true });

            // assert
            const state = stateHandler.get(11);
            expect(state.id).toBe(11);
            expect(state.property1).toBe("Test");
            expect(state.property2).toBe(123);
            expect(state.property3).toBe(true);
        });

    });

    describe("updating state with id", () => {

        it("should update existing property", () => {
            // arrange
            const stateHandler = new StateHandler();
            stateHandler.update({ id: 12, constantProperty: 321, variableProperty: 111 });

            // act
            stateHandler.update({ id: 12, variableProperty: 222 });

            // assert
            const state = stateHandler.get(12);
            expect(state.constantProperty).toBe(321);
            expect(state.variableProperty).toBe(222);
        });

        it("should update new property", () => {
            // arrange
            const stateHandler = new StateHandler();
            stateHandler.update({ id: 12, constantProperty: 321 });

            // act
            stateHandler.update({ id: 12, newProperty: 100 });

            // assert
            const state = stateHandler.get(12);
            expect(state.constantProperty).toBe(321);
            expect(state.newProperty).toBe(100);
        });

    });

    describe("removing state with id", () => {

        it("should not be able to retrieve state", () => {
            // arrange
            const stateHandler = new StateHandler();
            stateHandler.update({ id: 13, constantProperty: 321 });

            // act
            stateHandler.remove(13);

            // assert
            const state = stateHandler.get(13);
            expect(state).toBeUndefined();
            expect(stateHandler.state.length).toBe(0);
        });

    });

    describe("clearing state", () => {

        it("should have zero length", () => {
            // arrange
            const stateHandler = new StateHandler();
            stateHandler.update({ id: 1 });

            // act
            stateHandler.clear();

            // assert
            expect(stateHandler.state.length).toBe(0);
        });

    });

});