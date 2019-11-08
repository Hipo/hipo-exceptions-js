import {Exception, Options} from "../ExceptionTransformerModel";

function getErrorDetail(errorInfo: Exception | null | undefined){
  return errorInfo && typeof errorInfo.detail === "object" && errorInfo.detail
} 

export {getErrorDetail}