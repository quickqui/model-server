import { ValidateError } from "@quick-qui/model-core";
import { Define } from "./Define";


import enjoi from "enjoi";
import * as joi from "@hapi/joi";
import schema from "./DefineSchema.json";
const s = enjoi.schema(schema);

export function bySchema(defines:Define[]): ValidateError[] {
  return defines
    .map(def => {
      const { error, value } = joi.validate(def, s, { abortEarly: false });

      return (
        error?.details.map(detail => {
          return new ValidateError(
            `defines/${def.name ?? "_noName"}`,
            detail.message
          );
        }) ?? []
      );
    })
    .flat();
}