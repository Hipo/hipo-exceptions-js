import { createMapFromObject } from "./utils/mapUtils";
import {
  CustomTransformers,
  Exception,
  ExceptionMap,
  Options
} from "./ExceptionTransformerModel";
import { GENERIC_ERROR_MESSAGE } from "./utils/errorConstants";

class ExceptionTransformer {
  private readonly customTransformers?: CustomTransformers;

  // Initialize the custom exception transformers to the instance
  // If you need to handle custom logic according to exception.type, here is an example;
  // const customTransformers = {
  //   ProfileCredentialError: (exception: Exception) => {
  //     let exceptionMap = new Map();
  //
  //     exceptionMap = exceptionMap.set("email", "You shall not pass.");
  //
  //     return exceptionMap;
  //   },
  //   ...
  // };
  public constructor(customTransformers?: CustomTransformers) {
    if (customTransformers) {
      this.customTransformers = customTransformers;
    }
  }

  // Generates a Map from the exception object that came from API
  // Also, includes the `fallback_message` to the `exceptionMap`
  public generateExceptionMap(exception: Exception): ExceptionMap {
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

  public generateSpesificFieldError(errorInfo: Exception | null | undefined) {
    const detail =
      errorInfo && typeof errorInfo.detail === "object" && errorInfo.detail;

    if (detail) {
      return function getError(fieldName: string) {
        return detail[fieldName];
      };
    } else {
      return () => {};
    }
  }

  public generateErrorMessage(
    errorInfo: Exception,
    options: Options = {}
  ): string {
    let finalMessage = "";
    const { knownErrorKeys = [], skipTypes = [] } = options;

    try {
      if (!(skipTypes && skipTypes.includes(errorInfo.type))) {
        const errorDetail = errorInfo.detail;
        let shouldDisplayFallbackMessage = false;
        let message = "";

        if (errorDetail && typeof errorDetail === "object") {
          const errorDetailKeys = Object.keys(errorDetail);

          if (
            errorDetailKeys.includes("non_field_errors") &&
            errorDetail.non_field_errors
          ) {
            if (typeof errorDetail.non_field_errors[0] === "string") {
              message = errorDetail.non_field_errors[0];
            } else {
              shouldDisplayFallbackMessage = true;
            }
          } else {
            const unknownErrorKeys = errorDetailKeys.filter(errorKey => {
              return !(knownErrorKeys || []).includes(errorKey);
            });

            if (unknownErrorKeys.length) {
              message = `${unknownErrorKeys[0]}: ${
                errorDetail[unknownErrorKeys[0]]
              }`;
            }
          }
        } else {
          shouldDisplayFallbackMessage = true;
        }

        if (shouldDisplayFallbackMessage) {
          message = errorInfo.fallback_message
            ? errorInfo.fallback_message
            : GENERIC_ERROR_MESSAGE;
        }

        finalMessage = message;
      }
    } catch (error) {
      console.error(
        "Unknown error shape passed to ExceptionTransformer",
        error
      );
      finalMessage = GENERIC_ERROR_MESSAGE;
    }

    return finalMessage;
  }
}

export default ExceptionTransformer;
