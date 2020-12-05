import { ModelManager } from "./ModelManager";
import path from "path";
import { withDomainModel, withInfoModel } from "@quick-qui/model-defines";

test("empty folder", () => {
  const manager = new ModelManager(
    {
      protocol: "folder",
      resource: "./testModel",
    },
    "."
  );
  expect(manager).not.toBeUndefined;
});

test("a typical model", () => {
  const proPath = path.join(process.cwd(), "../prototype");
  console.log(`${proPath}`);
  const manager = new ModelManager(
    {
      protocol: "folder",
      resource: path.join(proPath, "model"),
    },
    proPath
  );
  expect(manager).not.toBeUndefined;
  const model = manager.getModel();
  return model.then((m) => {
    expect(m).not.toBeUndefined;
    expect(manager.getBuildLogs().length).not.toBe(0);
    expect(withDomainModel(m)?.domainModel?.entities?.length).not.toBe(0);
    expect(withInfoModel(m)?.infoModel).not.toBeUndefined
  });
});
