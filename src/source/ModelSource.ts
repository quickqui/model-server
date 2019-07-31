import { ModelFile } from "./ModelFile";

export interface Location {
    protocol: string
    resource: any
}

export interface ModelSource { 
    files: ModelFile[]; 
    includes: Location[];
}