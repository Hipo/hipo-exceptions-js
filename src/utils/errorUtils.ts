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
  customKey?: string;
  shouldCapitalizeErrorKey?: boolean;
  shouldHideErrorKey?: boolean;
  fieldLabelMap?: {[key: string]: string};
}

function getStringMessage(
  errorDetailValue: ExceptionDetailValue,
  keyOptions?: StringMessageGeneratorKeyOptions
): string {
  let message = "";

  if (Array.isArray(errorDetailValue)) {
    if (isArrayOfStrings(errorDetailValue)) {
      // errorDetailValue = ["", ""]
      message = generateMessageFromStringArray(
        errorDetailValue,
        keyOptions?.customKey
      );
    } else if (isArrayOfObjects(errorDetailValue)) {
      // errorDetailValue = [ {}, {}, {..} ]
      const firstNonEmptyErrorObject = (errorDetailValue as ExceptionDetail[]).find(
        (x) => !isObjectEmpty(x)
      );

      if (firstNonEmptyErrorObject) {
        message = getStringMessage(firstNonEmptyErrorObject, keyOptions);
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
        message = getStringMessage(
          errorDetailValue.non_field_errors,
          keyOptions
        );
      } else {
        const defaultErrorKey = errorDetailKeys[0];

        // If error detail is array of objects, it is a nested error, so
        // generation should continue with the original key options
        if (isArrayOfObjects(errorDetailValue[defaultErrorKey])) {
          message = getStringMessage(
            errorDetailValue[defaultErrorKey],
            keyOptions
          );
        } else {
          message = getStringMessage(errorDetailValue[defaultErrorKey], {
            // If not an array of objects, generate final error key using options
            customKey: getErrorKeyForStringMessageGenerator(
              defaultErrorKey,
              keyOptions
            )
          });
        }
      }
    }
  } else {
    // If `errorDetailValue` is neither string[], ExceptionDetail[] nor ExceptionDetail
    message = JSON.stringify(errorDetailValue);
  }

  return message;
}

function getErrorKeyForStringMessageGenerator(
  defaultErrorKey: string,
  keyOptions: StringMessageGeneratorKeyOptions | undefined
) {
  let errorKey: string | undefined = defaultErrorKey;

  if (keyOptions?.shouldHideErrorKey) {
    errorKey = undefined;
  } else if (keyOptions?.customKey) {
    errorKey = keyOptions?.customKey;
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
