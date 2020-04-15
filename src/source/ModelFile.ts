export interface ModelFile {
  fileName: string;
  path: string;
  relativeToModelDir:string,
  repositoryBase: string; //absolute
  modelObject: any;
}

export function fileToDTO(file: ModelFile) {
  return {
    fileName: file.fileName,
    path: file.path,
    relativeToModelDir: file.relativeToModelDir,
    repositoryBase: file.repositoryBase,
  };
}
