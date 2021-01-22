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
import {convertSnakeCaseToTitleCase} from "./stringUtils";

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
): string[] | undefined {
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

interface StringMessageGeneratorKeyOptions {
  shouldCapitalizeErrorKey?: boolean;
  shouldHideErrorKey?: boolean;
  fieldLabelMap?: {[key: string]: string};
}

function getStringMessage(
  errorDetailValue: ExceptionDetailValue,
  options?: {key?: string; keyOptions?: StringMessageGeneratorKeyOptions}
): string {
  let message = "";

  if (Array.isArray(errorDetailValue)) {
    if (isArrayOfStrings(errorDetailValue)) {
      // This is the exit condition of this recursion, string message can be generated now
      // errorDetailValue = ["", ""]
      message = generateMessageFromStringArray(
        errorDetailValue,
        generateErrorKeyToDisplay(options?.key || "", options?.keyOptions)
      );
    } else if (isArrayOfObjects(errorDetailValue)) {
      // errorDetailValue = [ {}, {}, {..} ]
      const firstNonEmptyErrorObject = (errorDetailValue as ExceptionDetail[]).find(
        (x) => !isObjectEmpty(x)
      );

      if (firstNonEmptyErrorObject) {
        message = getStringMessage(firstNonEmptyErrorObject, {
          keyOptions: options?.keyOptions
        });
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
        message = getStringMessage(errorDetailValue.non_field_errors, {
          keyOptions: options?.keyOptions
        });
      } else {
        const defaultErrorKey = errorDetailKeys[0];

        // Start recursion again with the first key's value
        // `key` should be sent in case `errorDetailValue[defaultErrorKey]` is the recursion's exit value: string[]
        // `key` then can be processed according to `keyOptions`
        message = getStringMessage(errorDetailValue[defaultErrorKey], {
          key: defaultErrorKey,
          keyOptions: options?.keyOptions
        });
      }
    }
  } else {
    // If `errorDetailValue` is neither string[], ExceptionDetail[] nor ExceptionDetail
    message = JSON.stringify(errorDetailValue);
  }

  return message;
}

function generateErrorKeyToDisplay(
  defaultErrorKey: string,
  keyOptions: StringMessageGeneratorKeyOptions | undefined
): string | undefined {
  let errorKey: string | undefined = defaultErrorKey;

  if (keyOptions?.shouldHideErrorKey) {
    errorKey = undefined;
  } else if (keyOptions?.fieldLabelMap?.[defaultErrorKey]) {
    errorKey = keyOptions.fieldLabelMap[defaultErrorKey];
  }

  if (errorKey && keyOptions?.shouldCapitalizeErrorKey) {
    errorKey = convertSnakeCaseToTitleCase(errorKey);
  }

  return errorKey;
}

function deleteProperty(exceptionDetail: ExceptionDetail, path: string) {
  const filteredObj = {...exceptionDetail};
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
  const filteredObj = {...exceptionDetail};
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
