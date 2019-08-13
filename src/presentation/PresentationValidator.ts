import { ModelValidator, ValidatError } from "../model/ModelManager";
import { Model } from "../model/Model";


export class PresentationValidator implements ModelValidator {
    validate(model: Model): ValidatError[] {
                //TODO 没有实现
        return []
    }
}