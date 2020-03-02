import { CustomTransformers, Exception, ExceptionMap, Options, OnUnexpectedException } from "./ExceptionTransformerModel";
interface ExceptionTransformerConfig {
    customTransformers?: CustomTransformers;
    onUnexpectedException?: OnUnexpectedException;
}
declare class ExceptionTransformer {
    private readonly customTransformers?;
    private genericErrorMessage;
    private readonly onUnexpectedException?;
    constructor(genericErrorMessage: string, config?: ExceptionTransformerConfig);
    changeGenericErrorMessage(newMessage: string): void;
    generateExceptionMap(exception: Exception): ExceptionMap;
    generateSpecificFieldError(errorInfo: Exception | null | undefined): (fieldName: string) => string[] | undefined;
    generateErrorMessage(errorInfo: Exception, options?: Options): string;
}
export default ExceptionTransformer;
