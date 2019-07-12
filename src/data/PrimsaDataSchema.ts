import { DomainModel, Property, List } from "../domain/DomainModel";
import * as camelCase from 'camelcase';
import * as _ from 'lodash'

export function toPrismaSchemaString(domainModel: DomainModel): string {
    //what?
    function typeMapping(type: any) {
        const scalas = ["string", "boolean"]
        if (type.itemType) {
            return `[${type.itemType}!]`
        }
        if (scalas.includes(type)) {
            return camelCase(type, { pascalCase: true })
        }
        return type
    }
    function typeToString(property: Property): string {
        const required = property.constraints && property.constraints.includes("required")
        if (property.type) {
            return `${typeMapping(property.type)}${required ? "!" : ""}`
        } else {
            if (property.relation) {
                if (property.relation.n === "one") {
                    let re = `${typeMapping(property.relation.to)}${required ? "!" : ""}`
                    return re
                } else if (property.relation.n == "many") {
                    let re = `[${typeMapping(property.relation.to)}!]!`
                    return re
                } else {
                    throw new Error(`unknown type property - ${JSON.stringify(property)}`)
                }
            } else {
                throw new Error(`unknown type property - ${JSON.stringify(property)}`)
            }
        }
        throw new Error(`unknown type property - ${JSON.stringify(property)}`)
    }
    function toDirective(property: Property): string {
        let re = ""
        if (property.relation) {
            if (property.relation.n === "one") {
                re += ` @relation(link: INLINE)`
            } else if (property.relation.n == "many") {
                re += ` @relation(link: TABLE)`
            } else {
                throw new Error(`illegal property relation - ${JSON.stringify(property)}`)
            }
        }
        
        if (property.type === "ID") {
            re += ` @id`
        }
        if (property.name === "createAt") {
            re += ` @createAt`
        }
        if (property.name === "updateAt") {
            re += ` @updateAt`
        }

        if (property.constraints && property.constraints.includes("unique")) {
            re += ` @unique`
        }
        if (!_.isUndefined(property.default)) {
            //TODO 需要处理字符串值的引号问题？
            re += ` @default(value: ${property.default})`
        }
        console.log(`property - ${JSON.stringify(property)}`)
        return re
    }
    function propertyToString(property: Property): string {
        //TODO 实现List。
        //TODO 实现required、type、relation的各种组合。
        return `${property.name}: ${typeToString(property)} ${toDirective(property)}`
    }
    //TODO 实现enum
    //TODO 解决缩进的问题
    return domainModel.entities.map((entity) => {
        return `type ${entity.name} {
                ${
            entity.properties.map((property) => propertyToString(property)).join("\n")
            }
            }`
    }).join("\n\n")
}