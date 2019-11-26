import { Exception, ExceptionDetail } from "../ExceptionTransformerModel";
declare function getErrorDetail(errorInfo: Exception | null | undefined): ExceptionDetail | null;
declare function isArrayOfString(x: unknown): boolean;
declare function isObjectEmpty(obj: unknown): boolean;
declare function generateMessageFromStringArray(array: string[], key?: string): string;
declare function getErrorDetailMessage(errorDetailValue: string[] | ExceptionDetail[] | ExceptionDetail, key?: string): string;
declare function deleteProperty(obj: ExceptionDetail, path: string): any;
declare function getValueFromPath(obj: ExceptionDetail, path: string): string[] | undefined;
export { getErrorDetail, isArrayOfString, isObjectEmpty, generateMessageFromStringArray, getErrorDetailMessage, deleteProperty, getValueFromPath };
