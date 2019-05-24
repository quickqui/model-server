

export interface FunctionModel {
    functions: Function[]
}

export interface Function {
    menuPath: string[]
    name: string
    base: {
        resource: string
        crud: string
    }
    filter: object
    sort: object
    actions: Action[]
    fields: {
        prefills: {
            name: string
            prefill: Prefill
        }[]
        hiddens: string[]
    }
}


interface Action {
    name: string
}
interface Prefill {
    value: string
}