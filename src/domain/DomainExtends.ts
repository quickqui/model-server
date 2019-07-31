import { DomainModel, Entity } from "./DomainModel";
import * as R from "ramda";


export function pushAll(model: DomainModel): DomainModel {
    const find = model.entities.find(R.propSatisfies(R.complement(R.isNil), 'extends'))
    if (find) {
        return pushAll(push(model, find))
    } else {
        return model
    }
}

function getEntity(model: DomainModel, name: string): Entity | undefined {
    return model.entities.find(R.propEq('name', name))
}

function push(model: DomainModel, entity: Entity): DomainModel {
    if (entity.extends) {
        const target = getEntity(model, entity.extends)
        if (target) {
            //TODO 处理冲突，同名的property 需要一个合并策略。
            entity.properties.forEach(_ => target.properties.push(_))
            return {
                entities: model.entities.filter(R.complement(R.propEq('name', entity.name))),
                enums: model.enums
            }
        } else {
            throw new Error(`no such entity - ${target}`)
        }
    } else {
        return model
    }
}
