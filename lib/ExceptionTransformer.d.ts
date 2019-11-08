import { CustomTransformers, Exception, ExceptionMap, Options } from "./ExceptionTransformerModel";
declare class ExceptionTransformer {
    private readonly customTransformers?;
    private readonly genericErrorMessage;
    constructor(genericErrorMessage: string, customTransformers?: CustomTransformers);
    generateExceptionMap(exception: Exception): ExceptionMap;
    generateSpesificFieldError(errorInfo: Exception | null | undefined): (fieldName: string) => any;
    generateErrorMessage(errorInfo: Exception, options?: Options): string;
}
export default ExceptionTransformer;
