import { createMapFromObject } from "./utils/mapUtils";
import { getErrorDetail } from "./utils/errorUtils";
class ExceptionTransformer {
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
    constructor(genericErrorMessage, customTransformers) {
        if (customTransformers) {
            this.customTransformers = customTransformers;
        }
        this.genericErrorMessage = genericErrorMessage;
    }
    // Generates a Map from the exception object that came from API
    // Also, includes the `fallback_message` to the `exceptionMap`
    generateExceptionMap(exception) {
        let exceptionMap = null;
        // Checking the existence of `customTransformers`
        // Every custom transformer should return a ExceptionMap
        if (this.customTransformers && this.customTransformers[exception.type]) {
            exceptionMap = this.customTransformers[exception.type](exception);
        }
        else {
            // Using a basic utility to create a Map from object
            exceptionMap = createMapFromObject(exception.detail);
        }
        if (!exceptionMap.get("fallback_message")) {
            exceptionMap = exceptionMap.set("fallback_message", exception.fallback_message);
        }
        return exceptionMap;
    }
    generateSpesificFieldError(errorInfo) {
        const errorDetail = getErrorDetail(errorInfo);
        if (errorDetail) {
            return function getError(fieldName) {
                return errorDetail[fieldName];
            };
        }
        return () => undefined;
    }
    generateErrorMessage(errorInfo, options = {}) {
        let finalMessage = "";
        const { knownErrorKeys = [], skipTypes = [] } = options;
        const shouldSkipError = skipTypes && skipTypes.includes(errorInfo.type);
        try {
            if (!shouldSkipError) {
                const errorDetail = getErrorDetail(errorInfo);
                let shouldDisplayFallbackMessage = false;
                let message = "";
                if (errorDetail) {
                    const errorDetailKeys = Object.keys(errorDetail);
                    if (errorDetailKeys.includes("non_field_errors") &&
                        errorDetail.non_field_errors) {
                        if (typeof errorDetail.non_field_errors[0] === "string") {
                            message = errorDetail.non_field_errors[0];
                        }
                        else {
                            shouldDisplayFallbackMessage = true;
                        }
                    }
                    else {
                        const unknownErrorKeys = errorDetailKeys.filter(errorKey => {
                            return !(knownErrorKeys || []).includes(errorKey);
                        });
                        if (unknownErrorKeys.length) {
                            message = `${unknownErrorKeys[0]}: ${errorDetail[unknownErrorKeys[0]]}`;
                        }
                    }
                }
                else {
                    shouldDisplayFallbackMessage = true;
                }
                if (shouldDisplayFallbackMessage) {
                    message = errorInfo.fallback_message || this.genericErrorMessage;
                }
                finalMessage = message;
            }
        }
        catch (error) {
            console.error("Unknown error shape passed to ExceptionTransformer", error);
            finalMessage = this.genericErrorMessage;
        }
        return finalMessage;
    }
}
export default ExceptionTransformer;
