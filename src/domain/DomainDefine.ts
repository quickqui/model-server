import { Entity, Enum, WithDomainModel } from "./DomainModel";
import * as _ from "lodash";
import { ModelDefine, Model, ValidateError } from "@quick-qui/model-core";

interface DomainPiece {
    entities: Entity[];
    enums: Enum[];
}


export class DomainDefine implements ModelDefine {
    name = "domain"
    filePattern: string = "**/*.domainModel.*"
   
    validatePiece(piece: any):ValidateError[]{
        return []
    }
    merge(model: Model & WithDomainModel, piece: any): Model {
        return {
            ...model,
            domainModel: {
                ...model.domainModel,
                entities: _(model.domainModel ? model.domainModel.entities : []).concat(piece.entities).compact().value(),
                enums: _(model.domainModel ? model.domainModel.enums : []).concat(piece.enums).compact().value()
            }
        }
    }
    validateAfterMerge(model: Model): ValidateError[] {
        return []
    }
    validateAfterWeave(model: Model): ValidateError[] {
        return []
    }

}

