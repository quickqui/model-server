import { ModelFile } from "./ModelFile";
import { ModelDefineConfig } from "../model/ModelDefine";

export interface Location {
    protocol: string
    resource: any
}

export interface ModelSource {
    name: string
    description: string
    files: ModelFile[];
    includes: Location[];
    includeSources: ModelSource[];
}