import { DomainModel, Property } from "../domain/DomainModel";
import * as camelCase from 'camelcase';
import * as _ from 'lodash'


export function toPlantUml(domainModel: DomainModel): string {



    function typeMapping(type: any) {
        const scalars = ["string", "boolean"]
        if (type.itemType) {
            return `[${type.itemType}!]`
        }
        if (scalars.includes(type)) {
            return camelCase(type, { pascalCase: true })
        }
        return type
    }
    function typeToString(property: Property): string {
        if (property.type) {
            return `${typeMapping(property.type)}`
        } else {
            if (property.relation) {
                if (property.relation.n === "one") {
                    let re = `${typeMapping(property.relation.to)}`
                    return re
                } else if (property.relation.n == "many") {
                    let re = `List[${typeMapping(property.relation.to)}]`
                    return re
                } else {
                    throw new Error(`unknown type property - ${JSON.stringify(property)}`)
                }
            } else {
                throw new Error(`unknown type property - ${JSON.stringify(property)}`)
            }
        }
    }
    function propertyToString(property: Property): string {
        //TODO 实现List。
        //TODO 实现required、type、relation的各种组合。
        return `${property.name}: ${typeToString(property)}`
    }



    return "@startuml\n\n" +
        domainModel.entities.map((entity) => {
            return `
            class ${entity.name} {
                ${
                entity.properties.map((property) => propertyToString(property)).join("\n")
                }
            }
        `
        }).join("\n\n") +
        //relations
        domainModel.entities.map((entity) => {
           return _(entity.properties).filter(
                (p) => !(_.isUndefined(p.relation))
            ).map(
                (p) => {
                    console.log(p)
                 return    p.relation && p.relation.to
                }
            ).map(
                (to) => {
                return `${entity.name} --> ${to}`
                }
            ).value().join("\n")
        }).join("\n") +

        "\n\n @enduml"
}
