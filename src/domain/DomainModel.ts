import { Inheritable } from "../model/Model";

export interface DomainModel {
    entities: Entity[]
    enums?: Enum[]
}

export interface Entity extends Inheritable {
    name: string
    properties: Property[]
    //TODO 随时考虑这个东西在这里的合理性。目前的用途是biref字段，严格来讲这个东西不应该是entity的属性。
    directives?: object
}

export interface Property {
    name: string
    type: string | List
    constraints?: Constraint[]
    default?: any
    relation?: Relation
}


export interface List {
    itemType: string
}

interface Enum {
    values: string[]
}

type Constraint = string

interface Relation {
    n: 'one'|'many'
    to: string
}


