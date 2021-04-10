import _ from "lodash";
import { no } from "./util/Util";
import { filterObject, deepMerge } from "@quick-qui/util";

export const env: {
  modelProjectDir: string;
  servicePort: number;
} = (() => {
  const defaults = {
    servicePort: 1111,
  };
  return deepMerge(
    defaults,
    filterObject({
      modelProjectDir: process.env.MODEL_PATH ?? no("MODEL_PATH"),
      servicePort: process.env.PORT && parseInt(process.env.PORT),
    })
  );
})();
