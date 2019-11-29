function getErrorDetail(errorInfo) {
    return errorInfo && typeof errorInfo.detail === "object" ? errorInfo.detail : null;
}
function isArrayOfString(x) {
    return Array.isArray(x) && x.every((item) => Boolean(item && typeof item === "string"));
}
function isArrayOfObject(x) {
    return Array.isArray(x) && x.every((item) => Boolean(item && typeof item === "object"));
}
function isObjectEmpty(obj) {
    return typeof obj === "object" && obj ? Object.keys(obj).length === 0 : false;
}
function generateMessageFromStringArray(array, key) {
    let message = array[0];
    return key ? `${key}: ${message}` : message;
}
function getStringMessage(errorDetailValue, key) {
    let message = "";
    if (Array.isArray(errorDetailValue)) {
        if (isArrayOfString(errorDetailValue)) {
            // errorDetailValue = ["", ""]
            message = generateMessageFromStringArray(errorDetailValue, key);
        }
        else if (isArrayOfObject(errorDetailValue)) {
            // errorDetailValue = [ {}, {}, {..} ] array of objects
            const firstNonEmptyErrorObject = errorDetailValue.find((x) => !isObjectEmpty(x));
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
function getValueFromPath(exceptionDetail, path) {
    const filteredObj = { ...exceptionDetail };
    const keys = path.split(".");
    return keys.reduce((acc, key) => {
        return acc && !Array.isArray(acc) ? acc[key] : undefined;
    }, filteredObj);
}
export { getErrorDetail, isArrayOfString, isObjectEmpty, generateMessageFromStringArray, getStringMessage, deleteProperty, getValueFromPath };
