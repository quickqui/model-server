import { FunctionModel } from "../function/FunctionModel";
export function functionsToPlantUml(functionModel: FunctionModel): string {
    return "@startuml\n\n" +
        functionModel.functions.map((fun) => {
            return `state ${fun.name}`;
        }).join("\n") +
        '\n\n'
        +
        functionModel.functions.map((fun) => {
            return (fun.links || []).map((link) => {
                return `${fun.name} -> ${link.function} : ${link.label}`;
            }).join("\n");
        }).join("\n\n")
        + "\n\n@enduml";
}
