"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapUtils_1 = require("./utils/mapUtils");
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
}
exports.default = ExceptionTransformer;
