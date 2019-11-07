declare type ExceptionMap = Map<string, object>;
interface ExceptionDetail {
    non_field_errors?: string[];
    [x: string]: undefined | any;
}
interface CustomTransformers {
    [type: string]: (params: Exception) => ExceptionMap;
}
interface Exception {
    type: string;
    detail: ExceptionDetail;
    fallback_message: string;
}
declare type Options = {
    knownErrorKeys?: string[] | null;
    skipTypes?: string[];
};
export { ExceptionMap, CustomTransformers, ExceptionDetail, Exception, Options };
