import Option from "../../../src/Scripts/foundation/modules/Option.js";

describe("Option.js", () => {

    describe("get option section", () => {

        it("should return section", () => {
            // arrange
            const optionObj = {
                type: Object,
                name: "Root",
                value: {
                    Section1: {
                        type: Object,
                        name: "Section 1"
                    }
                }
            };
            /** @type {Object} */
            const options = Option.Parse(optionObj);
            const expectedSection = optionObj.value.Section1;

            // act
            const section = options.Section1;

            // assert
            expect(section.type).toBe(expectedSection.type);
            expect(section.name).toBe(expectedSection.name);
        });

        it("should return subsection", () => {
            // arrange
            const optionObj = {
                type: Object,
                name: "Root",
                value: {
                    Section1: {
                        type: Object,
                        name: "Section 1",
                        value: {
                            Subsection1: {
                                type: Object,
                                name: "Subsection 1"
                            }
                        }
                    }
                }
            };
            /** @type {Object} */
            const options = Option.Parse(optionObj);
            const expectedSubsection = optionObj.value.Section1.value.Subsection1;

            // act
            const subsection = options.Section1.Subsection1;

            // assert
            expect(subsection.type).toBe(expectedSubsection.type);
            expect(subsection.name).toBe(expectedSubsection.name);
        });

    });

    describe("get option value", () => {

        it("should return string value", () => {
            // arrange
            const optionObj = {
                type: Object,
                name: "Root",
                value: {
                    Property1: {
                        type: String,
                        name: "Property 1",
                        value: "Value 1"
                    }
                }
            };
            /** @type {Object} */
            const options = Option.Parse(optionObj);
            const expectedValue = optionObj.value.Property1.value;

            // act
            const value = options.Property1;

            // assert
            expect(value).toBe(expectedValue);
        });

        it("should return string value in section", () => {
            // arrange
            const optionObj = {
                type: Object,
                name: "Root",
                value: {
                    Section1: {
                        type: Object,
                        name: "Section 1",
                        value: {
                            Property1: {
                                type: String,
                                name: "Property 1",
                                value: "Value 1"
                            }
                        }
                    }
                }
            };
            /** @type {Object} */
            const options = Option.Parse(optionObj);
            const expectedValue = optionObj.value.Section1.value.Property1.value;

            // act
            const value = options.Section1.Property1;

            // assert
            expect(value).toBe(expectedValue);
        });

        it("should return string value in subsection", () => {
            // arrange
            const optionObj = {
                type: Object,
                name: "Root",
                value: {
                    Section1: {
                        type: Object,
                        name: "Section 1",
                        value: {
                            Subsection1: {
                                type: Object,
                                name: "Subsection 1",
                                value: {
                                    Property1: {
                                        type: String,
                                        name: "Property 1",
                                        value: "Value 1"
                                    }
                                }
                            }
                        }
                    }
                }
            };
            /** @type {Object} */
            const options = Option.Parse(optionObj);
            const expectedValue = optionObj.value.Section1.value.Subsection1.value.Property1.value;

            // act
            const value = options.Section1.Subsection1.Property1;

            // assert
            expect(value).toBe(expectedValue);
        });

    });

});