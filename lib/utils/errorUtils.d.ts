import { Exception, ExceptionDetail } from "../ExceptionTransformerModel";
declare function getErrorDetail(errorInfo: Exception | null | undefined): ExceptionDetail | null;
declare function isArrayOfString(x: unknown): boolean;
declare function isObjectEmpty(obj: unknown): boolean;
declare function generateMessageFromStringArray(array: string[], key?: string): string;
declare function getStringMessage(errorDetailValue: string[] | ExceptionDetail[] | ExceptionDetail, key?: string): string;
declare function deleteProperty(exceptionDetail: ExceptionDetail, path: string): {
    [x: string]: string[] | ExceptionDetail | ExceptionDetail[];
};
declare function getValueFromPath(exceptionDetail: ExceptionDetail, path: string): string[] | ExceptionDetail | ExceptionDetail[] | undefined;
export { getErrorDetail, isArrayOfString, isObjectEmpty, generateMessageFromStringArray, getStringMessage, deleteProperty, getValueFromPath };
