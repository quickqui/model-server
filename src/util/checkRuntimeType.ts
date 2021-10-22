import { isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { VLogError } from "./VLogError";
import { ValidateError } from "@quick-qui/model-core";
export function checkRuntimeType(
  obj: any,
  type:any,
  errorContext: string
): any {
  // const re = type.decode(obj);
  // if (isRight(re)) {
  //   return obj;
  // } else {
  //   throw new VLogError(
  //     `runtime type check - ${errorContext}`,
  //     PathReporter.report(re).map(
  //       string => new ValidateError(errorContext, string)
  //     )
  //   );
    // }
  return obj

}
