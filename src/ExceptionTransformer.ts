import { createMapFromObject } from "./utils/mapUtils";
import {
  getErrorDetail,
  isObjectEmpty,
  getErrorDetailMessage,
  deleteProperty,
  getValueFromPath
} from "./utils/errorUtils";
import {
  CustomTransformers,
  Exception,
  ExceptionMap,
  Options
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
    error: any;
    errorInfo: Exception;
  }) => void;

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
  public constructor(
    genericErrorMessage: string,
    config?: ExceptionTransformerConfig
  ) {
    if (config && config.customTransformers) {
      this.customTransformers = config.customTransformers;
    }

    if (config && config.onUnexpectedException) {
      this.onUnexpectedException = config.onUnexpectedException;
    }
    this.genericErrorMessage = genericErrorMessage;
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

  // Returns `getError` function, which returns the field error if there is errorDetail.
  // Otherwise returns () => undefined
  //
  // `getError` function returns value of given key if `fieldName` is string
  // `fieldName` can be "message.title.name" and this function can through
  // errorInfo = {
  //   message: {
  //     title: {
  //       name: ["a logical message"];
  //     }
  //   }
  // }
  // and return `["a logical message"]`
  //
  // No handling if value of the `fieldName` is not string[]
  public generateSpecificFieldError(
    errorInfo: Exception | null | undefined
  ): (fieldName: string) => string[] | undefined {
    const errorDetail = getErrorDetail(errorInfo);

    if (errorDetail) {
      return function getError(fieldName: string) {
        // fieldName can be string only
        return typeof fieldName === "string"
          ? getValueFromPath(errorDetail, fieldName)
          : undefined;
      };
    }

    return () => undefined;
  }

  // Generates a printable error message.
  // `skipTypes` array can be given to skip errors with given types.
  // `knownErrorKeys` array can be given to skip errors with given keys.
  // If all error keys in errorInfo.detail is known (is in `knownErrorKeys`) or errorInfo.type should skipped, an empty string is returned as message.
  // If there is a `non_field_errors` key in error detail, its first meaningful string message is returned.
  // If there is no `non_field_errors`, first unknown key's key and value is combined as a message.
  // If no meaningful message is generated using methods above, `fallback_message` is used as message.
  // If there is no `fallback_message`, `genericErrorMessage` will return as message.
  public generateErrorMessage(
    errorInfo: Exception,
    options: Options = {}
  ): string {
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
          message = getErrorDetailMessage(errorDetail);
        } else {
          shouldDisplayFallbackMessage = true;
        }

        if (shouldDisplayFallbackMessage) {
          message = errorInfo.fallback_message || this.genericErrorMessage;
          // log this if `onUnexpectedException` is provided
          this.onUnexpectedException &&
            this.onUnexpectedException({
              error: "FALLED_TO_FALLBACK",
              errorInfo
            });
        }

        finalMessage = message;
      }
    } catch (error) {
      // log this if `onUnexpectedException` is provided
      this.onUnexpectedException &&
        this.onUnexpectedException({ error, errorInfo });
      finalMessage = this.genericErrorMessage;
    }

    return finalMessage;
  }
}

export default ExceptionTransformer;
