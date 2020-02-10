import { createMapFromObject } from "../../src/utils/dataStructureUtils";

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
