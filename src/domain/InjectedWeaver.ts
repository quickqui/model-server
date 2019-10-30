import { pushAll as pushAllExtends } from "./DomainExtends";
import { ModelWeaver, Model, ModelWeaveLog } from "@quick-qui/model-core";
import { WithDomainModel } from "./DomainModel";


export class InjectedWeaver implements ModelWeaver {
    name = "inject";
    weave(model: Model): [Model, ModelWeaveLog[]] {
        const [domainModel, logs] = pushAllExtends((model as Model & WithDomainModel). domainModel!, []);
        return [{ ...model, domainModel }, logs];
    }
}
