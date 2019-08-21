import {
  CustomTransformers,
  Exception,
  ExceptionMap
} from "./ExceptionTransformerModel";
declare class ExceptionTransformer {
  private readonly customTransformers?;
  constructor(customTransformers?: CustomTransformers);
  generateExceptionMap(exception: Exception): ExceptionMap;
}
export default ExceptionTransformer;
