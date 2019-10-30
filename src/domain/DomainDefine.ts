import { Entity, Enum, WithDomainModel } from "./DomainModel";
import * as _ from "lodash";
import { ModelDefine, Model, ValidateError } from "@quick-qui/model-core";

interface DomainPiece {
    entities: Entity[];
    enums: Enum[];
}


export class DomainDefine implements ModelDefine<DomainPiece> {
    name = "domain"
    filePattern: string = "**/*.domainModel.*"
    toPiece(source: object): DomainPiece {
        return source as DomainPiece
    }
  
    merge(model: Model & WithDomainModel, piece: DomainPiece): Model {
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

