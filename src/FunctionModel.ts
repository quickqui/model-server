

export interface FunctionModel {
    functions: Function[]
}

export interface Function {
    menuPath: string
    icon: string
    name: string
    base: {
        function: string
        resource: string
    }
    filter: object
    sort: object
    prefill: object

    links: Link[]
    action: Action
}


interface Link {
    label: string
    type: "entity"|"list"
    function: string
    args: object
}

interface Action{
    
}
