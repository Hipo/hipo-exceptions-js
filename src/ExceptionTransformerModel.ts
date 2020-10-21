type ExceptionMap = Map<string, object>;

interface ExceptionDetail {
  [key: string]: ExceptionDetailValue;
}

type ExceptionDetailValue = string[] | ExceptionDetail | ExceptionDetail[];

interface CustomTransformers {
  [type: string]: (params: Exception) => ExceptionMap;
}

interface Exception {
  type: string;
  detail: ExceptionDetail;
  fallback_message: string;
}

type ErrorMessageGeneratorOptions = {
  knownErrorKeys?: string[] | null;
  skipTypes?: string[];
  shouldHideErrorKey?: boolean;
  shouldCapitalizeErrorKey?: boolean;
  fieldLabelMap?: { [key: string]: string };
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
  ErrorMessageGeneratorOptions,
  OnUnexpectedException,
  ExceptionDetailValue
};
