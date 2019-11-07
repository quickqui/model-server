export function useCaseToPlantUml(functionModel: any): string| undefined {
    const uml = functionModel.functions.map((fun) => {
        return (fun.roles || []).map((role) => {
            return `:${role}: -> (${fun.name})`;
        }).join("\n");
    }).join("\n\n")
    if (uml.trim() !== '')
        return "@startuml\n\n" + uml
            + "\n\n@enduml";
    else return undefined
}
