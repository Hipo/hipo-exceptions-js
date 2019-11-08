function getErrorDetail(errorInfo) {
    return errorInfo && typeof errorInfo.detail === "object" && errorInfo.detail;
}
export { getErrorDetail };
