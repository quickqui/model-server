import { Entity, DomainModel } from "./DomainModel";

export function defaultProperties(entity: Entity): Entity {
    return {
        name: entity.name,
        properties: entity.properties.concat(
            [
                { name: 'id', type: 'ID', constraints: ['required'] },
                { name: 'createAt', type: 'DateTime', constraints: ['required'] },
                { name: 'updateAt', type: 'DateTime', constraints: ['required'] }
            ]
        )
    }
}




export function domainInherite(domainModel: DomainModel): DomainModel {
    return {
        entities: domainModel.entities.map((entity) => defaultProperties(entity)),
        enums: domainModel.enums
    }
}