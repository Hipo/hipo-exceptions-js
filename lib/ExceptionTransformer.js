"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapUtils_1 = require("./utils/mapUtils");
const errorConstants_1 = require("./utils/errorConstants");
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
    constructor(customTransformers) {
        if (customTransformers) {
            this.customTransformers = customTransformers;
        }
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
            exceptionMap = mapUtils_1.createMapFromObject(exception.detail);
        }
        if (!exceptionMap.get("fallback_message")) {
            exceptionMap = exceptionMap.set("fallback_message", exception.fallback_message);
        }
        return exceptionMap;
    }
    generateSpesificFieldError(errorInfo) {
        const detail = errorInfo && typeof errorInfo.detail === "object" && errorInfo.detail;
        if (detail) {
            return function getError(fieldName) {
                return detail[fieldName];
            };
        }
        else {
            return () => { };
        }
    }
    generateErrorMessage(errorInfo, options = {}) {
        let finalMessage = "";
        const { knownErrorKeys = [], skipTypes = [] } = options;
        try {
            if (!(skipTypes && skipTypes.includes(errorInfo.type))) {
                const errorDetail = errorInfo.detail;
                let shouldDisplayFallbackMessage = false;
                let message = "";
                if (errorDetail && typeof errorDetail === "object") {
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
                    message = errorInfo.fallback_message
                        ? errorInfo.fallback_message
                        : errorConstants_1.GENERIC_ERROR_MESSAGE;
                }
                finalMessage = message;
            }
        }
        catch (error) {
            console.error("Unknown error shape passed to ExceptionTransformer", error);
            finalMessage = errorConstants_1.GENERIC_ERROR_MESSAGE;
        }
        return finalMessage;
    }
}
exports.default = ExceptionTransformer;
