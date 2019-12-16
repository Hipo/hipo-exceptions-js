import { Exception, ExceptionDetail } from "../ExceptionTransformerModel";

function getErrorDetail(
  errorInfo: Exception | null | undefined
): ExceptionDetail | null {
  return errorInfo && typeof errorInfo.detail === "object"
    ? errorInfo.detail
    : null;
}

function isArrayOfString(x: unknown): boolean {
  return (
    Array.isArray(x) &&
    x.every(item => Boolean(item && typeof item === "string"))
  );
}

function isArrayOfObject(x: unknown): boolean {
  return (
    Array.isArray(x) &&
    x.every(item => Boolean(item && typeof item === "object"))
  );
}

function isObjectEmpty(obj: unknown): boolean {
  return typeof obj === "object" && obj ? Object.keys(obj).length === 0 : false;
}

function generateMessageFromStringArray(array: string[], key?: string): string {
  let message = array[0];

  return key ? `${key}: ${message}` : message;
}

function generateFieldErrorFromErrorDetail(
  fieldName: string,
  errorDetail: ExceptionDetail
) {
  let fieldError: string[] | undefined;
  //fieldName can be string only
  if (typeof fieldName === "string") {
    const errorValue = getValueFromPath(errorDetail, fieldName);

    // errorValue can be string[], ExceptionDetail[], ExceptionDetail or undefined
    if (errorValue) {
      if (isArrayOfString(errorValue)) {
        fieldError = errorValue as string[];
      } else {
        fieldError = getStringMessage(errorValue)
          ? [getStringMessage(errorValue)]
          : undefined;
      }
    }
  }

  return fieldError;
}

function getStringMessage(
  errorDetailValue: string[] | ExceptionDetail[] | ExceptionDetail,
  key?: string
): string {
  let message = "";

  if (Array.isArray(errorDetailValue)) {
    if (isArrayOfString(errorDetailValue)) {
      // errorDetailValue = ["", ""]
      message = generateMessageFromStringArray(
        errorDetailValue as string[],
        key
      );
    } else if (isArrayOfObject(errorDetailValue)) {
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

  keys.reduce<undefined | string[] | ExceptionDetail | ExceptionDetail[]>(
    (value, key, index) => {
      if (value && !Array.isArray(value)) {
        if (index === keys.length - 1) {
          delete value[key];
        }

        return value[key];
      }
    },
    filteredObj
  );

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

  return keys.reduce<
    undefined | string[] | ExceptionDetail | ExceptionDetail[]
  >((acc, key) => {
    return acc && !Array.isArray(acc) ? acc[key] : undefined;
  }, filteredObj);
}

export {
  getErrorDetail,
  isArrayOfString,
  isObjectEmpty,
  generateMessageFromStringArray,
  generateFieldErrorFromErrorDetail,
  getStringMessage,
  deleteProperty,
  removeKnownKeysFromErrorDetail,
  getValueFromPath
};
