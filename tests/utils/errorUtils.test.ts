import { generateMessageFromStringArray } from "../../src/utils/errorUtils";

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
