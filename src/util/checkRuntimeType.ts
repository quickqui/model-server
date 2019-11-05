import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
export function checkRuntimeType(obj: any,type:any,errorContext:string) : any {
    const re = type.decode(obj)
    if (isRight(re)) {
        return obj;
    }
    else {
        throw new Error(errorContext+'\n'+PathReporter.report(re).join("\n"));
    }
}
