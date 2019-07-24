import { Entity, DomainModel } from "./DomainModel";
import * as _ from 'lodash'

export function defaultProperties(entity: Entity): Entity {
    return _.assign(entity, {
        properties: entity.properties.concat(
            [
                { name: 'id', type: 'ID', constraints: ['required'] },
                { name: 'createAt', type: 'DateTime', constraints: ['required'] },
                { name: 'updateAt', type: 'DateTime', constraints: ['required'] }
            ]
        ),
    })
}


function hasBrief(entity: Entity): boolean {
    if (!entity.directives) return false
    if (!entity.directives['brief']) return false
    return true
}


//TODO 是否应该在这里？
function defaultBrief(entity: Entity): Entity {
    const guesName = ["name", "title", "subject", "description", "code", "text", "content"]
    if (!hasBrief(entity)) {
        const guessedName = guesName.find((gn) => {
            return !!(entity.properties.find((p) => p.name == gn))
        })
        if (guessedName) {
            //TODO 需要验证，这个merge是否会冲掉所有的derictive
            return _.assign(entity, { directives: { brief: guessedName } })
        } else
            return entity
    }
    return entity
}

//TODO 统一的继承模型需要再考虑，是merge还是assign？
export function domainInherite(domainModel: DomainModel): DomainModel {
    const entityLevelFuns = _.flow([defaultProperties, defaultBrief])
    return {
        entities: domainModel.entities.map((entity) => entityLevelFuns(entity)),
        enums: domainModel.enums
    }
}