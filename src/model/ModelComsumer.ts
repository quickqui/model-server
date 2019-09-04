import { Model } from "./Model";
import { Log } from "./ModelDefine";


export interface ModelConsumer {
    validate(model: Model): ModelValidateError[]
    consume(model: Model): ModelConsumeLog[]
}

export class ModelValidateError implements Log{
    level: string = 'error'
    category: string = 'model-validate'
    message: string = ''
    constructor(message: string) {
        this.message = message
    }
}
export class ModelConsumeLog implements Log{
    level: string = 'info'
    category: string = 'model-consume'
    message: string = ''
    constructor(message: string) {
        this.message = message
    }
}