

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
    prefill: object
}


interface Action {
    name: string
}
