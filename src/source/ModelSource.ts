import { ModelFile } from "./ModelFile";
import { ValidateError } from "@quick-qui/model-core";

export interface Location {
  protocol: string;
  resource: any;
}

export interface ModelSource {
  name: string;
  description: string;
  files: ModelFile[];
  includes: Location[];
  includeSources: ModelSource[];
}

export interface ModelSourceValidator {
  validate(modelSources: ModelSource[]): ValidateError[];
}
