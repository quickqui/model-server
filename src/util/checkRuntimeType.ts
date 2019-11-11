import { isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
export function checkRuntimeType(
  obj: any,
  type: any,
  errorContext: string
): any {
  const re = type.decode(obj);
  if (isRight(re)) {
    return obj;
  } else {
    throw new VLogError(errorContext, PathReporter.report(re));
  }
}

export class VLogError extends Error {
  logs: string[] = [];
  constructor(message: string, logs: string[]) {
    super(message);
    this.logs = logs;
  }
}
