

export interface PresentationModel {
    presentatins: Presentation[]
}

export interface Presentation {
    name: string //TODO 貌似不需要
    context: string
    resource: string
    display: FieldRule[]
    brief: string
}

type FieldRule = string