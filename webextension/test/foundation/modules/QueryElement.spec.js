import QueryElement from "../../../src/Scripts/foundation/modules/QueryElement.js";

describe("QueryElement.js", () => {

    describe("empty div", () => {

        it("should have no children", () => {
            // arrange
            const div = document.createElement("div");
            const queryElement = new QueryElement(div);

            // act
            const children = queryElement.children();

            // assert
            expect(children.length).toBe(0);
        });

        it("should not have matching class", () => {
            // arrange
            const div = document.createElement("div");
            const queryElement = new QueryElement(div);

            // act
            const result = queryElement.hasClass("test");

            // assert
            expect(result).toBeFalse();
        });

    });

    describe("div with class", () => {

        it("should have matching class", () => {
            // arrange
            const div = document.createElement("div");
            div.className = "test";
            const queryElement = new QueryElement(div);

            // act
            const result = queryElement.hasClass("test");

            // assert
            expect(result).toBeTrue();
        });

        it("any() should have matching tag name and class", () => {
            // arrange
            const div = document.createElement("div");
            div.className = "test";
            const queryElement = new QueryElement(div);

            // act
            const result = queryElement.filter(x => x.prop("tagName") === "DIV" && x.prop("className") === "test");

            // assert
            expect(result.length).toBe(1);
        });

    });

    describe("div with children", () => {
        
        it("should have correct number of children", () => {
            // arrange
            const div = document.createElement("div");
            const child1 = document.createElement("span");
            const child2 = document.createElement("span");
            child1.className = "child-1";
            child2.className = "child-2";
            div.appendChild(child1);
            div.appendChild(child2);
            const queryElement = new QueryElement(div);

            // act
            const children = queryElement.children();

            // assert
            expect(children.length).toBe(2);
        });

        it("should get the correct first children", () => {
            // arrange
            const div = document.createElement("div");
            const child1 = document.createElement("span");
            const child2 = document.createElement("span");
            const child3 = document.createElement("span");
            child1.className = "child-1";
            child2.className = "child-2";
            child3.className = "child-3";
            div.appendChild(child1);
            div.appendChild(child2);
            div.appendChild(child3);
            const queryElement = new QueryElement(div);

            // act
            const firstChild = queryElement.children().first();

            // assert
            expect(firstChild.hasClass("child-1")).toBeTrue();
        });

        it("should get the correct last children", () => {
            // arrange
            const div = document.createElement("div");
            const child1 = document.createElement("span");
            const child2 = document.createElement("span");
            const child3 = document.createElement("span");
            child1.className = "child-1";
            child2.className = "child-2";
            child3.className = "child-3";
            div.appendChild(child1);
            div.appendChild(child2);
            div.appendChild(child3);
            const queryElement = new QueryElement(div);

            // act
            const lastChild = queryElement.children().last();

            // assert
            expect(lastChild.hasClass("child-3")).toBeTrue();
        });

    });

});