import { CustomTransformers, Exception, ExceptionMap, Options } from "./ExceptionTransformerModel";
interface ExceptionTransformerConfig {
    customTransformers?: CustomTransformers;
    onUnexpectedException?: (details: {
        error: any;
        errorInfo: Exception;
    }) => void;
}
declare class ExceptionTransformer {
    private readonly customTransformers?;
    private readonly genericErrorMessage;
    private readonly onUnexpectedException?;
    constructor(genericErrorMessage: string, config?: ExceptionTransformerConfig);
    generateExceptionMap(exception: Exception): ExceptionMap;
    generateSpecificFieldError(errorInfo: Exception | null | undefined): (fieldName: string) => string[] | undefined;
    generateErrorMessage(errorInfo: Exception, options?: Options): string;
}
export default ExceptionTransformer;
