import { ModelDefine } from "../model/ModelDefine";
import { Model } from "../model/Model";
import { Entity, Enum } from "./DomainModel";
import * as _ from "lodash";
import { ValidatError } from "../model/ModelManager";

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
    whenCut(model: Model, piece: DomainPiece): Model {
        //TODO push extends here
        return model
    }
    whenMerge(model: Model, piece: DomainPiece): Model {
        return {
            ...model,
            domainModel: {
                ...model.domainModel,
                entities: _(model.domainModel ? model.domainModel.entities : []).concat(piece.entities).compact().value(),
                enums: _(model.domainModel ? model.domainModel.enums : []).concat(piece.enums).compact().value()
            }
        }
    }
    validate(model:Model):ValidatError[]{
        return []
    }

}