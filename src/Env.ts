import _ from "lodash";
import { no, filterObject } from "./util/Util";

export const env: {
  modelProjectDir: string;
  servicePort: number;
} = (() => {
  const defaults = {
    servicePort: 1111
  };

  return _.assign(
    {},
    defaults,
    filterObject({
      modelProjectDir: process.env.MODEL_PATH ?? no("MODEL_PATH"),
      servicePort:
        process.env.PORT && parseInt(process.env.PORT)
    })
  );
})();
