import { createMapFromObject } from "./utils/mapUtils";
import {
  getErrorDetail,
  isObjectEmpty,
  getStringMessage,
  deleteProperty,
  getValueFromPath,
  isArrayOfString
} from "./utils/errorUtils";
import {
  CustomTransformers,
  Exception,
  ExceptionMap,
  Options,
  ExceptionDetail
} from "./ExceptionTransformerModel";

interface ExceptionTransformerConfig {
  customTransformers?: CustomTransformers;
  onUnexpectedException?: (details: {
    error: any;
    errorInfo: Exception;
  }) => void;
}

class ExceptionTransformer {
  private readonly customTransformers?: CustomTransformers;
  private readonly genericErrorMessage: string;
  private readonly onUnexpectedException?: (details: {
    type: string;
    error: any;
    errorInfo: Exception;
  }) => void;

  constructor(
    genericErrorMessage: string,
    config?: ExceptionTransformerConfig
  ) {
    if (config) {
      if (config.customTransformers) {
        this.customTransformers = config.customTransformers;
      }

      if (config.onUnexpectedException) {
        this.onUnexpectedException = config.onUnexpectedException;
      }
    }
    this.genericErrorMessage = genericErrorMessage;
  }

  // Generates a Map from the exception object that came from API
  // Also, includes the `fallback_message` to the `exceptionMap`
  generateExceptionMap(exception: Exception): ExceptionMap {
    let exceptionMap = null;

    // Checking the existence of `customTransformers`
    // Every custom transformer should return a ExceptionMap
    if (this.customTransformers && this.customTransformers[exception.type]) {
      exceptionMap = this.customTransformers[exception.type](exception);
    } else {
      // Using a basic utility to create a Map from object
      exceptionMap = createMapFromObject(exception.detail);
    }

    if (!exceptionMap.get("fallback_message")) {
      exceptionMap = exceptionMap.set(
        "fallback_message",
        exception.fallback_message
      );
    }
    return exceptionMap;
  }

  /*  Returns `getError` function, which returns the field error if there is errorDetail.
      Otherwise returns () => undefined
      
      `getError` function returns value of given key if `fieldName` is string
      `fieldName` can be "message.title.name" and this function can through
      errorInfo = {
        message: {
          title: {
            name: ["a logical message"];
          }
        }
      }
      and return `["a logical message"]`

      if value of the `fieldName` is not string[], 
      it will generate the first meaningful message and return it as string[]
  */
  generateSpecificFieldError(
    errorInfo: Exception | null | undefined
  ): (fieldName: string) => string[] | undefined {
    const errorDetail = getErrorDetail(errorInfo);
    let fieldError: string[] | undefined;

    if (errorDetail) {
      return function getError(fieldName: string) {
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
      };
    }

    if (errorInfo && this.onUnexpectedException) {
      this.onUnexpectedException({
        type: "NO_ERROR_DETAIL",
        error: undefined,
        errorInfo
      });
    }

    return () => undefined;
  }

  /*  Generates a printable error message.
   *   `options`:
   *            `skipTypes`: (array of strings) Error types to be skipped.
   *             `knownErrorKeys`: (array of strings) Error keys to be skipped inside `Exception["detail"]`.
   *
   *   Returns "";  when all error keys in errorInfo.detail are known (that is they are included in `knownErrorKeys`) or errorInfo.type should skipped.
   *   Returns first meaningful string found in non_field_errors, if it exists.
   *   Returns `${key}: ${value}`; When there is no non_field_errors, returns the first unknown key and its value combined in a string.
   *   Returns fallback_message; when it couldn't generate any meaningful message using the methods above.
   *   Returns genericErrorMessage; when there is no fallback_message
   */
  generateErrorMessage(errorInfo: Exception, options: Options = {}): string {
    const { knownErrorKeys = [], skipTypes = [] } = options;
    const shouldSkipError = skipTypes && skipTypes.includes(errorInfo.type);
    let finalMessage = "";

    try {
      if (!shouldSkipError) {
        let errorDetail = getErrorDetail(errorInfo);
        let shouldDisplayFallbackMessage = false;
        let message = "";

        if (errorDetail && !isObjectEmpty(errorDetail)) {
          if (knownErrorKeys && knownErrorKeys.length) {
            errorDetail = knownErrorKeys.reduce((object, errorKey) => {
              // delete all `knownErrorKeys` from errorDetail
              return deleteProperty(object, errorKey);
            }, errorDetail);
          }
          message = getStringMessage(errorDetail);
        } else {
          shouldDisplayFallbackMessage = true;
        }

        if (shouldDisplayFallbackMessage) {
          message = errorInfo.fallback_message || this.genericErrorMessage;

          // call `onUnexpectedException` if it fell to the fallback message
          if (this.onUnexpectedException) {
            this.onUnexpectedException({
              type: "FELL_TO_FALLBACK",
              error: undefined,
              errorInfo
            });
          }
        }

        finalMessage = message;
      }
    } catch (error) {
      // log this if `onUnexpectedException` is provided
      if (this.onUnexpectedException) {
        this.onUnexpectedException({
          type: "CAUGHT_ERROR",
          error,
          errorInfo
        });
      }
      finalMessage = this.genericErrorMessage;
    }

    return finalMessage;
  }
}

export default ExceptionTransformer;
