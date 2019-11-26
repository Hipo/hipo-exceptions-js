function getErrorDetail(errorInfo) {
    return errorInfo && typeof errorInfo.detail === "object"
        ? errorInfo.detail
        : null;
}
function isArrayOfString(x) {
    return Array.isArray(x) && x.every(item => Boolean(item && typeof item === "string"));
}
function isArrayOfObject(x) {
    return Array.isArray(x) && x.every(item => Boolean(item && typeof item === "object"));
}
function isObjectEmpty(obj) {
    return typeof obj === "object" && obj ? Object.keys(obj).length === 0 : false;
}
function generateMessageFromStringArray(array, key) {
    let message = array[0];
    return key ? `${key}: ${message}` : message;
}
function getErrorDetailMessage(errorDetailValue, key) {
    let message = "";
    if (Array.isArray(errorDetailValue)) {
        if (isArrayOfString(errorDetailValue)) {
            // errorDetailValue = ["", ""] 
            message = generateMessageFromStringArray(errorDetailValue, key);
        }
        else if (isArrayOfObject(errorDetailValue)) {
            // errorDetailValue = [ {}, {}, {..} ] array of objects
            const errorObject = errorDetailValue.find((x) => !isObjectEmpty(x));
            if (errorObject) {
                // errorDetailValue = {..} -> a non-empty object
                message = getErrorDetailMessage(errorObject);
            }
        }
    }
    else if (typeof errorDetailValue === "object") {
        // errorDetailValue = {..} || {}
        const errorDetailKeys = Object.keys(errorDetailValue);
        if (errorDetailKeys.includes("non_field_errors") && errorDetailValue.non_field_errors) { // if exists, `non_field_errors` has priority
            message = getErrorDetailMessage(errorDetailValue.non_field_errors);
        }
        else if (errorDetailKeys.length) { // check if object is empty
            message = getErrorDetailMessage(errorDetailValue[errorDetailKeys[0]], errorDetailKeys[0]);
        }
    }
    else {
        // If `errorDetailValue` is neither string[], ExceptionDetail[] nor ExceptionDetail
        message = JSON.stringify(errorDetailValue);
    }
    return message;
}
function deleteProperty(obj, path) {
    const _obj = JSON.parse(JSON.stringify(obj));
    const keys = path.split(".");
    keys.reduce((acc, key, index) => {
        if (acc) {
            if (index === keys.length - 1) {
                delete acc[key];
            }
            return acc[key];
        }
    }, _obj);
    return _obj;
}
function getValueFromPath(obj, path) {
    let _obj = JSON.parse(JSON.stringify(obj));
    const keys = path.split(".");
    _obj = keys.reduce((acc, key) => {
        return acc && acc[key];
    }, _obj);
    return _obj;
}
export { getErrorDetail, isArrayOfString, isObjectEmpty, generateMessageFromStringArray, getErrorDetailMessage, deleteProperty, getValueFromPath };
