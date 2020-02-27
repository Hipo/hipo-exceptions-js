import {
  generateMessageFromStringArray,
  getErrorDetail
} from "../../src/utils/errorUtils";
import { Exception } from "../../src/ExceptionTransformerModel";

describe("generateMessageFromStringArray", () => {
  const mockStringArray = ["name", "password", "email"];

  const emptyStringsArray = ["", "", ""];
  const emptyFirstElementArray = ["", "second item", "third item"];

  describe("when key is not passed", () => {
    it("should return undefined when given array is empty", () => {
      const message = generateMessageFromStringArray([]);
      expect(message).toBe(undefined);
    });

    it("should return empty string when the first element is empty", () => {
      const emptyStringsArrayMessage = generateMessageFromStringArray(
        emptyStringsArray
      );
      const emptyFirstElementArrayMessage = generateMessageFromStringArray(
        emptyFirstElementArray
      );

      expect(emptyStringsArrayMessage).toBe("");
      expect(emptyFirstElementArrayMessage).toBe("");
    });

    it("should return first element value when it's not empty", () => {
      const message = generateMessageFromStringArray(mockStringArray);

      expect(message).toBe("name");
    });
  });

  describe("when key is passed", () => {
    it("should return first string when key is empty", () => {
      const message = generateMessageFromStringArray(mockStringArray, "");

      expect(message).toBe("name");
    });

    it("should return 'key: first string' when key is not empty string", () => {
      const message = generateMessageFromStringArray(["first string"], "key");

      expect(message).toBe("key: first string");
    });

    it("should return 'key: ' when key is not empty string but first element is empty", () => {
      const message = generateMessageFromStringArray(
        emptyFirstElementArray,
        "key"
      );

      expect(message).not.toBe("key: name");
      expect(message).toBe("key: ");
    });
  });
});

describe("getErrorDetail", () => {
  it("should return null when given undefined or null", () => {
    const undefinedResult = getErrorDetail(undefined);
    const nullResult = getErrorDetail(null);

    expect(undefinedResult).toBe(null);
    expect(nullResult).toBe(null);
  });

  it("should return empty object when detail is an empty object", () => {
    const mockError = {
      type: "ValidationError",
      detail: {},
      fallback_message: ""
    };
    const detail = getErrorDetail(mockError);

    expect(detail).toStrictEqual({});
  });

  it("should be able to handle 'complex detail array with objects'", () => {
    const mockError: Exception = {
      type: "ValidationError",
      detail: {
        non_field_errors: [
          { address: ["The address entered is not valid."] },
          { phone_number: ["The phone number entered is not valid."] }
        ]
      },
      fallback_message: "This is a random fallback message"
    };

    const detail = getErrorDetail(mockError);

    expect(detail).toStrictEqual({
      non_field_errors: [
        { address: ["The address entered is not valid."] },
        { phone_number: ["The phone number entered is not valid."] }
      ]
    });
  });

  it("should be able to handle 'complex detail array with (some) empty objects'", () => {
    const mockErrorWithSomeEmptyObjects: Exception = {
      type: "ValidationError",
      detail: {
        non_field_errors: [
          {},
          {},
          { address: ["The address entered is not valid."] },
          { phone_number: ["The phone number entered is not valid."] }
        ]
      },
      fallback_message: "This is a random fallback message"
    };
    const mockErrorWithOnlyEmptyObjects: Exception = {
      type: "ValidationError",
      detail: {
        non_field_errors: [{}, {}]
      },
      fallback_message: "This is a random fallback message"
    };

    const detailWithSomeEmptyObjects = getErrorDetail(
      mockErrorWithSomeEmptyObjects
    );
    const detailWithOnlyEmptyObjects = getErrorDetail(
      mockErrorWithOnlyEmptyObjects
    );

    expect(detailWithSomeEmptyObjects).toStrictEqual({
      non_field_errors: [
        {},
        {},
        { address: ["The address entered is not valid."] },
        { phone_number: ["The phone number entered is not valid."] }
      ]
    });
    expect(detailWithOnlyEmptyObjects).toStrictEqual({
      non_field_errors: [{}, {}]
    });
  });

  it("should return detail object correctly when given an ordinary error", () => {
    const mockError = {
      type: "ValidationError",
      detail: {
        email: ["Enter a valid email address."],
        password: ["Enter a valid password address."]
      },
      fallback_message: "This is a random fallback message"
    };
    const detail = getErrorDetail(mockError);

    expect(detail).toStrictEqual(mockError.detail);
  });
});
