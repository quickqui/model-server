import { Entity } from "./DomainModel";

export default function base(entity: Entity): Entity {
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