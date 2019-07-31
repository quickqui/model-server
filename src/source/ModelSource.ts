import { ModelFile } from "./ModelFile";


interface ModelSource { 
    files: ModelFile[]; 
    includes: ModelSource[]
}