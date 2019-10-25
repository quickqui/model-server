import { ModelWeaver, ModelWeaveLog } from "../model/ModelWeaver";
import { Model } from "../model/Model";
import { pushAll as pushAllExtends } from "./DomainExtends";


export class InjectedWeaver implements ModelWeaver {
    name = "inject";
    weave(model: Model): [Model, ModelWeaveLog[]] {
        const [domainModel, logs] = pushAllExtends(model.domainModel!, []);
        return [{ ...model, domainModel }, logs];
    }
}
