export interface ModelFile {
  fileName: string;
  path: string;
  repositoryBase: string; //absolute
  modelObject: any;
}

export function fileToDTO(file: ModelFile) {
  return {
    fileName: file.fileName,
    path: file.path,
    repositoryBase: file.repositoryBase
  };
}
