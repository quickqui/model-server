import { Inheritable } from "../Model";

export interface DomainModel {
    entities: Entity[]
    enums?: Enum[]
}

export interface Entity extends Inheritable {
    name: string
    properties: Property[]
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


