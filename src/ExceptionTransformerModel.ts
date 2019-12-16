type ExceptionMap = Map<string, object>;

interface ExceptionDetail {
  [key: string]: string[] | ExceptionDetail | ExceptionDetail[];
}

interface CustomTransformers {
  [type: string]: (params: Exception) => ExceptionMap;
}

interface Exception {
  type: string;
  detail: ExceptionDetail;
  fallback_message: string;
}

type Options = {
  knownErrorKeys?: string[] | null;
  skipTypes?: string[];
};

type OnUnexpectedException = (details: {
  type: string;
  error: any;
  errorInfo: Exception;
}) => void;

export {
  ExceptionMap,
  CustomTransformers,
  ExceptionDetail,
  Exception,
  Options,
  OnUnexpectedException
};
