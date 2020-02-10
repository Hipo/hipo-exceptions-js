"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataStructureUtils_1 = require("./dataStructureUtils");
function getErrorDetail(errorInfo) {
    return errorInfo && typeof errorInfo.detail === "object"
        ? errorInfo.detail
        : null;
}
exports.getErrorDetail = getErrorDetail;
function generateMessageFromStringArray(array, key) {
    const message = array[0];
    return key ? `${key}: ${message}` : message;
}
exports.generateMessageFromStringArray = generateMessageFromStringArray;
function generateFieldErrorFromErrorDetail(fieldName, errorDetail) {
    let fieldError;
    //fieldName can be string only
    if (typeof fieldName === "string") {
        const errorValue = getValueFromPath(errorDetail, fieldName);
        // errorValue can be string[], ExceptionDetail[], ExceptionDetail or undefined
        if (errorValue) {
            if (dataStructureUtils_1.isArrayOfString(errorValue)) {
                fieldError = errorValue;
            }
            else {
                fieldError = getStringMessage(errorValue)
                    ? [getStringMessage(errorValue)]
                    : undefined;
            }
        }
    }
    return fieldError;
}
exports.generateFieldErrorFromErrorDetail = generateFieldErrorFromErrorDetail;
function getStringMessage(errorDetailValue, key) {
    let message = "";
    if (Array.isArray(errorDetailValue)) {
        if (dataStructureUtils_1.isArrayOfString(errorDetailValue)) {
            // errorDetailValue = ["", ""]
            message = generateMessageFromStringArray(errorDetailValue, key);
        }
        else if (dataStructureUtils_1.isArrayOfObject(errorDetailValue)) {
            // errorDetailValue = [ {}, {}, {..} ]
            const firstNonEmptyErrorObject = errorDetailValue.find(x => !dataStructureUtils_1.isObjectEmpty(x));
            if (firstNonEmptyErrorObject) {
                message = getStringMessage(firstNonEmptyErrorObject);
            }
        }
    }
    else if (typeof errorDetailValue === "object") {
        // errorDetailValue = {..} || {}
        const errorDetailKeys = Object.keys(errorDetailValue);
        if (errorDetailKeys.length) {
            // `non_field_errors` has priority
            if (errorDetailKeys.includes("non_field_errors") &&
                errorDetailValue.non_field_errors) {
                message = getStringMessage(errorDetailValue.non_field_errors);
            }
            else {
                // Generate message from the immediately found field error
                message = getStringMessage(errorDetailValue[errorDetailKeys[0]], errorDetailKeys[0]);
            }
        }
    }
    else {
        // If `errorDetailValue` is neither string[], ExceptionDetail[] nor ExceptionDetail
        message = JSON.stringify(errorDetailValue);
    }
    return message;
}
exports.getStringMessage = getStringMessage;
function deleteProperty(exceptionDetail, path) {
    const filteredObj = { ...exceptionDetail };
    const keys = path.split(".");
    keys.reduce((value, key, index) => {
        if (value && !Array.isArray(value)) {
            if (index === keys.length - 1) {
                delete value[key];
            }
            return value[key];
        }
    }, filteredObj);
    return filteredObj;
}
exports.deleteProperty = deleteProperty;
function removeKnownKeysFromErrorDetail(errorDetail, knownErrorKeys) {
    if (knownErrorKeys && knownErrorKeys.length) {
        // delete all `knownErrorKeys` from errorDetail
        errorDetail = knownErrorKeys.reduce(deleteProperty, errorDetail);
    }
    return errorDetail;
}
exports.removeKnownKeysFromErrorDetail = removeKnownKeysFromErrorDetail;
function getValueFromPath(exceptionDetail, path) {
    const filteredObj = { ...exceptionDetail };
    const keys = path.split(".");
    return keys.reduce((acc, key) => {
        return acc && !Array.isArray(acc) ? acc[key] : undefined;
    }, filteredObj);
}
exports.getValueFromPath = getValueFromPath;
