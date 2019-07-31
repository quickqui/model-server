import { ModelFile } from "./ModelFile";

export interface Location {
    protocol: string
    resource: any
}

export interface ModelSource { 
    description: string
    files: ModelFile[]; 
    includes: Location[];
    includeSources: ModelSource[];
}