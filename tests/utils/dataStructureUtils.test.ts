import {
  createMapFromObject,
  isArrayOfStrings,
  isArrayOfObjects,
  isObjectEmpty
} from "../../src/utils/dataStructureUtils";

describe("createMapFromObject", () => {
  it("should return empty map when given empty object", () => {
    const resultedMap = createMapFromObject({});
    const expectedMap = new Map();

    expect(resultedMap).toEqual(expectedMap);
  });

  it("should be able to handle string object pair", () => {
    const mockError = {
      type: "ValidationError",
      detail: {
        email: ["Enter a valid email address."],
        password: ["Enter a valid password address."]
      },
      fallback_message: "This is a random fallback message"
    };
    const mockResponse = new Map<string, any>([
      ["type", "ValidationError"],
      [
        "detail",
        {
          email: ["Enter a valid email address."],
          password: ["Enter a valid password address."]
        }
      ],
      ["fallback_message", "This is a random fallback message"]
    ]);

    const resultedMap = createMapFromObject(mockError);

    expect(resultedMap).toEqual(mockResponse);
  });

  it("should be able to handle string 'empty object' pair", () => {
    const mockError = {
      type: "ValidationError",
      detail: {},
      fallback_message: ""
    };
    const mockResponse = new Map<string, any>([
      ["type", "ValidationError"],
      ["detail", {}],
      ["fallback_message", ""]
    ]);

    const resultedMap = createMapFromObject(mockError);

    expect(resultedMap).toEqual(mockResponse);
  });

  it("should be able to handle string and 'complex array with empty objects'", () => {
    const mockError = {
      type: "ValidationError",
      detail: {
        non_field_errors: [
          {},
          {},
          {},
          {},
          { phone_number: ["The phone number entered is not valid."] }
        ]
      },
      fallback_message: "This is a random fallback message"
    };
    const mockResponse = new Map<string, any>([
      ["type", "ValidationError"],
      [
        "detail",
        {
          non_field_errors: [
            {},
            {},
            {},
            {},
            { phone_number: ["The phone number entered is not valid."] }
          ]
        }
      ],
      ["fallback_message", "This is a random fallback message"]
    ]);

    const resultedMap = createMapFromObject(mockError);

    expect(resultedMap).toEqual(mockResponse);
  });
});

describe("isArrayOfStrings", () => {
  it("should return false when given null or undefined", () => {
    const undefinedResult = isArrayOfStrings(undefined);
    const nullResult = isArrayOfStrings(null);

    expect(undefinedResult).toBe(false);
    expect(nullResult).toBe(false);
  });

  it("should return false when given string", () => {
    const emptyStringResult = isArrayOfStrings("");
    const nonEmptyStringResult = isArrayOfStrings("not-empty-string");

    expect(emptyStringResult).toBe(false);
    expect(nonEmptyStringResult).toBe(false);
  });

  it("should return true when given array of empty string", () => {
    const emptyStringArrayResult = isArrayOfStrings([""]);
    const longEmptyStringArrayResult = isArrayOfStrings(["", "", "", ""]);

    expect(emptyStringArrayResult).toBe(true);
    expect(longEmptyStringArrayResult).toBe(true);
  });

  it("should return true when given array of non empty string(s)", () => {
    const stringArrayResult = isArrayOfStrings(["just 1 string"]);
    const longStringArrayResult = isArrayOfStrings([
      "array",
      "with",
      "many, many... What the heck so many",
      "strings"
    ]);

    expect(stringArrayResult).toBe(true);
    expect(longStringArrayResult).toBe(true);
  });
});

describe("isArrayOfObjects", () => {
  it("should return false when given null or undefined", () => {
    const undefinedResult = isArrayOfObjects(undefined);
    const nullResult = isArrayOfObjects(null);

    expect(undefinedResult).toBe(false);
    expect(nullResult).toBe(false);
  });

  it("should return false when given an object", () => {
    const emptyObjectResult = isArrayOfObjects({});
    const nonEmptyObjectResult = isArrayOfObjects({
      "key-string": "value-string"
    });

    expect(emptyObjectResult).toBe(false);
    expect(nonEmptyObjectResult).toBe(false);
  });

  it("should return true when any given object in the array is empty", () => {
    const emptyObjectsArrayResult = isArrayOfObjects([{}]);
    const longEmptyObjectsArrayResult = isArrayOfObjects([{}, {}, {}, {}]);
    const oneEmptyObjectInTheArrayResult = isArrayOfObjects([
      {
        type: "ValidationError",
        detail: {
          email: ["Enter a valid email address."],
          password: ["Enter a valid password address."]
        }
      },
      {
        type: "ValidationError",
        detail: {
          email: ["Enter a valid email address."],
          password: ["Enter a valid password address."]
        }
      },
      {}
    ]);

    expect(emptyObjectsArrayResult).toBe(true);
    expect(longEmptyObjectsArrayResult).toBe(true);
    expect(oneEmptyObjectInTheArrayResult).toBe(true);
  });

  it("should return true when given array of non empty object(s)", () => {
    const objectArrayResult = isArrayOfObjects([
      { "key-string-1": "value-string-1" }
    ]);
    const longObjectArrayResult = isArrayOfObjects([
      {
        type: "ValidationError",
        detail: {
          email: ["Enter a valid email address."],
          password: ["Enter a valid password address."]
        }
      },
      {
        type: "ValidationError",
        detail: {
          email: ["Enter a valid email address."],
          password: ["Enter a valid password address."]
        }
      },
      {
        type: "ValidationError",
        detail: {
          email: ["Enter a valid email address."],
          password: ["Enter a valid password address."]
        }
      },
      {
        type: "ValidationError"
      }
    ]);

    expect(objectArrayResult).toBe(true);
    expect(longObjectArrayResult).toBe(true);
  });

  it("should return false when given array of array(s)", () => {
    const emptyArrayOfArrayResult = isArrayOfObjects([[]]);
    const emptyArrayOfArraysResult = isArrayOfObjects([[], []]);
    const notEmptyArrayOfArraysResult = isArrayOfObjects([[1]]);
    const someEmptyArrayOfArraysResult = isArrayOfObjects([
      [],
      ["not", "empty", "array"],
      []
    ]);
    const arrayOfArraysAndObjectsResult = isArrayOfObjects([
      [],
      ["not", "empty", "array"],
      { "object-key": "object-value" }
    ]);

    expect(emptyArrayOfArrayResult).toBe(false);
    expect(emptyArrayOfArraysResult).toBe(false);
    expect(notEmptyArrayOfArraysResult).toBe(false);
    expect(someEmptyArrayOfArraysResult).toBe(false);
    expect(arrayOfArraysAndObjectsResult).toBe(false);
  });
});

describe("isObjectEmpty", () => {
  it("should return false when given something else than object", () => {
    expect(isObjectEmpty(undefined)).toBe(false);
    expect(isObjectEmpty(null)).toBe(false);

    expect(isObjectEmpty(true)).toBe(false);

    expect(isObjectEmpty(123)).toBe(false);
    expect(isObjectEmpty(123.003)).toBe(false);

    expect(isObjectEmpty("")).toBe(false);
    expect(isObjectEmpty("string")).toBe(false);

    expect(isObjectEmpty([])).toBe(false);
    expect(isObjectEmpty(["not empty", "array of", "strings"])).toBe(false);

    expect(isObjectEmpty(() => ":)")).toBe(false);
  });

  it("should return true when object is empty", () => {
    expect(isObjectEmpty({})).toBe(true);
  });

  it("should return false when object is not empty", () => {
    expect(isObjectEmpty({ "any key": "any value" })).toBe(false);
  });
});
