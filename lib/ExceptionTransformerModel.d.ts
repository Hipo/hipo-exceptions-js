declare type ExceptionMap = Map<string, object>;
interface ExceptionDetail {
    [x: string]: string[];
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
