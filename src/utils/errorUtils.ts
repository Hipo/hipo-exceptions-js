import {
  Exception,
  ExceptionDetail,
  ExceptionDetailValue
} from "../ExceptionTransformerModel";
import {
  isArrayOfStrings,
  isArrayOfObjects,
  isObjectEmpty
} from "./dataStructureUtils";

function getErrorDetail(
  errorInfo: Exception | null | undefined
): ExceptionDetail | null {
  return errorInfo && typeof errorInfo.detail === "object"
    ? errorInfo.detail
    : null;
}

function generateMessageFromStringArray(array: string[], key?: string): string {
  const message = array[0];

  return key ? `${key}: ${message}` : message;
}

function generateFieldErrorFromErrorDetail(
  fieldName: string,
  errorDetail: ExceptionDetail
) {
  if (typeof fieldName !== "string") {
    throw new Error("fieldName can be string only");
  }

  let fieldError: string[] | undefined;

  const errorValue = getValueFromPath(errorDetail, fieldName);

  // errorValue can be string[], ExceptionDetail[], ExceptionDetail or undefined
  if (errorValue) {
    if (isArrayOfStrings(errorValue)) {
      fieldError = errorValue;
    } else {
      const stringMessage = getStringMessage(errorValue);
      fieldError = stringMessage ? [stringMessage] : undefined;
    }
  }

  return fieldError;
}

function getStringMessage(
  errorDetailValue: ExceptionDetailValue,
  key?: string
): string {
  let message = "";

  if (Array.isArray(errorDetailValue)) {
    if (isArrayOfStrings(errorDetailValue)) {
      // errorDetailValue = ["", ""]
      message = generateMessageFromStringArray(errorDetailValue, key);
    } else if (isArrayOfObjects(errorDetailValue)) {
      // errorDetailValue = [ {}, {}, {..} ]
      const firstNonEmptyErrorObject = (errorDetailValue as ExceptionDetail[]).find(
        x => !isObjectEmpty(x)
      );

      if (firstNonEmptyErrorObject) {
        message = getStringMessage(firstNonEmptyErrorObject);
      }
    }
  } else if (typeof errorDetailValue === "object") {
    // errorDetailValue = {..} || {}
    const errorDetailKeys = Object.keys(errorDetailValue);

    if (errorDetailKeys.length) {
      // `non_field_errors` has priority
      if (
        errorDetailKeys.includes("non_field_errors") &&
        errorDetailValue.non_field_errors
      ) {
        message = getStringMessage(errorDetailValue.non_field_errors);
      } else {
        // Generate message from the immediately found field error
        message = getStringMessage(
          errorDetailValue[errorDetailKeys[0]],
          errorDetailKeys[0]
        );
      }
    }
  } else {
    // If `errorDetailValue` is neither string[], ExceptionDetail[] nor ExceptionDetail
    message = JSON.stringify(errorDetailValue);
  }

  return message;
}

function deleteProperty(exceptionDetail: ExceptionDetail, path: string) {
  const filteredObj = { ...exceptionDetail };
  const keys = path.split(".");

  keys.reduce<undefined | ExceptionDetailValue>((value, key, index) => {
    if (value && !Array.isArray(value)) {
      if (index === keys.length - 1) {
        delete value[key];
      }

      return value[key];
    }
  }, filteredObj);

  return filteredObj;
}

function removeKnownKeysFromErrorDetail(
  errorDetail: ExceptionDetail,
  knownErrorKeys: string[] | null
): ExceptionDetail {
  if (knownErrorKeys && knownErrorKeys.length) {
    // delete all `knownErrorKeys` from errorDetail
    errorDetail = knownErrorKeys.reduce(deleteProperty, errorDetail);
  }

  return errorDetail;
}

function getValueFromPath(exceptionDetail: ExceptionDetail, path: string) {
  const filteredObj = { ...exceptionDetail };
  const keys = path.split(".");

  return keys.reduce<undefined | ExceptionDetailValue>((acc, key) => {
    return acc && !Array.isArray(acc) ? acc[key] : undefined;
  }, filteredObj);
}

export {
  getErrorDetail,
  generateMessageFromStringArray,
  generateFieldErrorFromErrorDetail,
  getStringMessage,
  deleteProperty,
  removeKnownKeysFromErrorDetail,
  getValueFromPath
};
