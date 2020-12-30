import {
  generateMessageFromStringArray,
  getErrorDetail,
  generateFieldErrorFromErrorDetail,
  getValueFromPath,
  getStringMessage,
  deleteProperty,
  removeKnownKeysFromErrorDetail
} from "../../src/utils/errorUtils";
import {
  Exception,
  ExceptionDetailValue,
  ExceptionDetail
} from "../../src/ExceptionTransformerModel";

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
          {address: ["The address entered is not valid."]},
          {phone_number: ["The phone number entered is not valid."]}
        ]
      },
      fallback_message: "This is a random fallback message"
    };

    const detail = getErrorDetail(mockError);

    expect(detail).toStrictEqual({
      non_field_errors: [
        {address: ["The address entered is not valid."]},
        {phone_number: ["The phone number entered is not valid."]}
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
          {address: ["The address entered is not valid."]},
          {phone_number: ["The phone number entered is not valid."]}
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
        {address: ["The address entered is not valid."]},
        {phone_number: ["The phone number entered is not valid."]}
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

describe("generateFieldErrorFromErrorDetail", () => {
  const mockErrorDetail: ExceptionDetail = {
    title: ["Title is missing"],
    questions: [{}, {}, {}, {answer: ["required"]}, {}],
    additional_info: {name: ["This field is required"]}
  };

  it("should return correct field error", () => {
    const fieldError = generateFieldErrorFromErrorDetail(
      "title",
      mockErrorDetail
    );
    expect(fieldError).toBe(mockErrorDetail.title);
  });

  it("should return correct field error when field's value is not string[]", () => {
    const fieldError = generateFieldErrorFromErrorDetail(
      "questions",
      mockErrorDetail
    );
    expect(fieldError).toStrictEqual(["answer: required"]);
  });

  it("should return correct field error when a more spesific field error is wanted", () => {
    const fieldError = generateFieldErrorFromErrorDetail(
      "additional_info.name",
      mockErrorDetail
    );
    expect(fieldError).toStrictEqual(["This field is required"]);
  });
});

describe("getStringMessage", () => {
  describe("when error detail is an array of objects", () => {
    const mockErrorDetail: ExceptionDetailValue = [
      {},
      {},
      {},
      {
        phone_number: ["The phone number entered is not valid."]
      },
      {
        address: ["This field is required."]
      }
    ];

    it("should return first non empty object's string", () => {
      const message = getStringMessage(mockErrorDetail);
      expect(message).toBe(
        "phone_number: The phone number entered is not valid."
      );
    });

    it("should return first non empty object's string with beautified key when given option", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {
          shouldCapitalizeErrorKey: true
        }
      });
      expect(message).toBe(
        "Phone Number: The phone number entered is not valid."
      );
    });

    it("should both replace key and capitalize when options are given", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {
          fieldLabelMap: {
            phone_number: "tel_no"
          },
          shouldCapitalizeErrorKey: true
        }
      });
      expect(message).toBe("Tel No: The phone number entered is not valid.");
    });

    it("should not display error key in message when shouldHideErrorKey is true", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {shouldHideErrorKey: true}
      });
      expect(message).toBe("The phone number entered is not valid.");
    });

    it("should replace error key using fieldLabelMap", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {fieldLabelMap: {phone_number: "Custom Title"}}
      });
      expect(message).toBe(
        "Custom Title: The phone number entered is not valid."
      );
    });

    it("should not replace error key if no matching value in fieldLabelMap", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {fieldLabelMap: {address: "Custom Title"}}
      });
      expect(message).toBe(
        "phone_number: The phone number entered is not valid."
      );
    });
  });

  describe("when error detail is an object", () => {
    const mockErrorDetail: ExceptionDetailValue = {
      title: ["Title is missing"],
      questions: [{}, {}, {}, {answer: ["required"]}, {}]
    };

    it("should return first field's error message", () => {
      const message = getStringMessage(mockErrorDetail);
      expect(message).toBe("title: Title is missing");
    });

    it("should not get affected by `fieldLabelMap`", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {
          fieldLabelMap: {"": "Additional Documents"}
        }
      });
      expect(message).toBe("title: Title is missing");
    });
  });

  describe("when error detail is an object with `non_field_errors`", () => {
    const mockErrorDetail: ExceptionDetailValue = {
      title: ["Title is missing"],
      questions: [
        {},
        {
          answer: ["required"]
        }
      ],
      non_field_errors: ["Attachments or body must be provided."]
    };

    it("should return non-field error message", () => {
      const message = getStringMessage(mockErrorDetail);
      expect(message).toBe("Attachments or body must be provided.");
    });

    it("should return non-field error message with key given in `fieldLabelMap`", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {fieldLabelMap: {"": "Additional Documents"}}
      });
      expect(message).toBe(
        "Additional Documents: Attachments or body must be provided."
      );
    });
  });

  describe("when error detail is an array of strings", () => {
    const mockErrorDetail = [
      "This field can't be missing",
      "Title should be more than 4 characters"
    ];

    it("should return first string in the array", () => {
      const message = getStringMessage(mockErrorDetail);
      expect(message).toBe(mockErrorDetail[0]);
    });

    it("should add given key to the message and return", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {
          fieldLabelMap: {"": "title"},
          shouldCapitalizeErrorKey: true
        }
      });
      expect(message).toBe("Title: This field can't be missing");
    });
  });

  describe("when error detail is an object of an array of objects", () => {
    const mockErrorDetail: ExceptionDetailValue = {
      manual_part_process_quotes: [
        {lead_time: ["Lead time is required."]},
        {lead_time: ["Lead time is required."]}
      ]
    };

    it("should return the first meaningful error", () => {
      const message = getStringMessage(mockErrorDetail);

      expect(message).toBe("lead_time: Lead time is required.");
    });

    it("should remove error key when `shouldHideErrorKey` is true", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {shouldHideErrorKey: true}
      });

      expect(message).toBe("Lead time is required.");
    });

    it("should replace error key using given `fieldLabelMap`", () => {
      const message = getStringMessage(mockErrorDetail, {
        keyOptions: {
          fieldLabelMap: {
            lead_time: "TIME"
          }
        }
      });

      expect(message).toBe("TIME: Lead time is required.");
    });
  });
});

describe("deleteProperty", () => {
  const mockErrorDetail = {
    summary: ["Summary is missing"],
    message: {
      non_field_errors: ["Attachments or body must be provided."],
      title: ["Message title is missing"]
    }
  };

  it("should delete property in given path", () => {
    const mockErrorDetailWithoutMessage = deleteProperty(
      mockErrorDetail,
      "message"
    );
    const mockErrorDetailWithoutMessageTitle = deleteProperty(
      mockErrorDetail,
      "message.title"
    );

    expect(mockErrorDetailWithoutMessage).toStrictEqual({
      summary: ["Summary is missing"]
    });
    expect(mockErrorDetailWithoutMessageTitle).toStrictEqual({
      summary: ["Summary is missing"],
      message: {
        non_field_errors: ["Attachments or body must be provided."]
      }
    });
  });
});

describe("removeKnownKeysFromErrorDetail", () => {
  const mockErrorDetail = {
    summary: ["Summary is missing"],
    message: {
      non_field_errors: ["Attachments or body must be provided."],
      title: ["Message title is missing"]
    }
  };

  it("should return same object if knownErrorKeys is null", () => {
    const errorDetail = removeKnownKeysFromErrorDetail(mockErrorDetail, null);

    expect(errorDetail).toStrictEqual(mockErrorDetail);
  });

  it("should return object without known keys", () => {
    const errorDetail = removeKnownKeysFromErrorDetail(mockErrorDetail, [
      "message.non_field_errors",
      "summary"
    ]);

    expect(errorDetail).toStrictEqual({
      message: {
        title: ["Message title is missing"]
      }
    });
  });
});

describe("getValueFromPath", () => {
  const mockErrorDetail = {
    message: {
      body: ["Message body is missing"],
      attachment: ["Attachment is missing"]
    },
    password: ["Password is too short", "Please use only letters and numbers"]
  };

  it("should return undefined when given non-existing path", () => {
    const value = getValueFromPath(mockErrorDetail, "message.title");

    expect(value).toBe(undefined);
  });

  it("should return the correct value in the path", () => {
    const value = getValueFromPath(mockErrorDetail, "message.attachment");

    expect(value).toStrictEqual(mockErrorDetail.message.attachment);
  });
});
