import { ModelValidator, ValidateError } from "../model/ModelManager";
import { Model } from "../model/Model";


export class DomainValidator implements ModelValidator {
    validate(model: Model): ValidateError[] {
        //TODO 没有实现
        return []
    }

}