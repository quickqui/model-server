import { ModelManager } from "./ModelManager";
import path from "path";
import {
  withDomainModel,
  withInfoModel,
} from "@quick-qui/model-defines";

describe("models", () => {
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

  test("a typical model", async () => {
    expect.hasAssertions();
    const proPath = path.join(process.cwd(), "../prototype");
    const manager = new ModelManager(
      {
        protocol: "folder",
        resource: path.join(proPath, "model"),
      },
      proPath
    );
    expect(manager).not.toBeUndefined;
    const model = await manager.getModel();
    expect(model).not.toBeUndefined;
    expect(manager.getBuildLogs().length).not.toBe(0);
    // console.log(manager.getBuildLogs())
    expect(withDomainModel(model)?.domainModel?.entities?.length).not.toBe(0);
    expect(withInfoModel(model)?.infoModel).not.toBeUndefined;
  });

  test("a typical model with evaluate", async () => {
    expect.hasAssertions();
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
    const model = await manager.getModel();
    expect(model).not.toBeUndefined;
    expect(manager.getBuildLogs().length).not.toBe(0);
    expect(withDomainModel(model)?.domainModel?.entities?.length).not.toBe(0);
    expect(withInfoModel(model)?.infoModel).not.toBeUndefined;
   
    // expect(
    //   withImplementationModel(model)?.implementationModel?.implementations
    // ).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       env: expect.objectContaining({ PORT: 4001 }),
    //     }),
    //     expect.objectContaining({
    //       env: expect.objectContaining({
    //         APP_SERVER_URL: "http://localhost:4001",
    //       }),
    //     }),
    //   ])
    // );
  });
});
