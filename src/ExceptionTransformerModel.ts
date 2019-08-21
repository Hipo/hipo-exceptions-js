type ExceptionMap = Map<string, object>;

interface ExceptionDetail {
  [fieldName: string]: object;
}

interface CustomTransformers {
  [type: string]: (params: Exception) => ExceptionMap;
}

interface Exception {
  type: string;
  detail: ExceptionDetail;
  fallback_message: string;
}

export { ExceptionMap, CustomTransformers, ExceptionDetail, Exception };
