import express from "express";
import bodyParser from "body-parser";

import { ModelManager } from "./model/ModelManager";
import { getManager, getManagers, ManagerCell } from "./MultiModel";
import { env } from "./Env";

import cors from "cors";
import { toDTO } from "./source/ModelSource";

const app = express();
const port = env.servicePort; // default port to listen

app.use(cors());

function withManager(req, res, fun: (modelManager: ModelManager) => void) {
  const managerId = req.params["id"] ?? "default";
  const modelManager = getManager(managerId);
  if (modelManager) fun(modelManager);
  else {
    res
      .status(404)
      .json({ code: 404, message: `Model not found - ${managerId}` });
  }
}
function withNext(next, fun): void {
  try {
    fun();
  } catch (e) {
    next(e);
  }
}

function get(
  path: string,
  fun: (res, modelManager: ModelManager) => void
): void {
  app.get(path, async function(req, res, next) {
    withNext(next, () =>
      withManager(req, res, modelManager => fun(res, modelManager))
    );
  });
}

app.use(bodyParser.text());

get("/models/:id", async (res, modelManager) => {
  const model = await modelManager.getModel();
  if (model) res.status(200).json(model);
  else
    res.status(404).json({
      code: 404,
      message: "Model not built successful, see next",
      next: "/model/:id/logs"
    });
});

get("/models/:id/logs", (res, modelManager) => {
  const logs = modelManager.getBuildLogs();
  res
    .status(200)
    .header("Content-Range", logs.length)
    .json(logs);
});
get("/models/:id/modelSources", async (res, modelManager) => {
  const sources = await modelManager.getSource().then(ss => ss.map(toDTO));
  res
    .status(200)
    .header("Content-Range", sources.length)
    .json(sources);
});

app.post("/models/:id/refresh", async function(req, res, next) {
  try {
    withManager(req, res, modelManager => {
      modelManager.refresh();
      res.status(201).send("refresh success");
    });
  } catch (e) {
    next(e);
  }
});

app.get("/models", (req, res, next) => {
  try {
    const ms = getManagers();
    res
      .status(200)
      .header("Content-Range", ms.length + "")
      .json(
        ms.map((cell: ManagerCell) => {
          return { id: cell.id, name: cell.name };
        })
      );
  } catch (e) {
    next(e);
  }
});

// app.post("/deploy", async function(req, res, next) {
//   try {
//     const model = (await modelManager.getModel()) as any;
//     try {
//       await insuringProject();
//     } catch (e) {}

//     const prismaSchemaSource = toPrismaSchemaString(model.domainModel!);
//     const result = await deploy(prismaSchemaSource, undefined, false, false);
//     res.status(200).json(result);
//   } catch (e) {
//     next(e);
//   }
// });

// app.post("/deploy/dry", async function(req, res, next) {
//   try {
//     const model = (await modelManager.getModel()) as any;
//     try {
//       await insuringProject();
//     } catch (e) {}
//     const prismaSchemaSource = toPrismaSchemaString(model.domainModel!);
//     const result = await deploy(prismaSchemaSource, undefined, true, false);
//     res.status(200).json(result);
//   } catch (e) {
//     next(e);
//   }
// });

// app.post("/deploy/force", async function(req, res, next) {
//   try {
//     const model = (await modelManager.getModel()) as any;
//     try {
//       await insuringProject();
//     } catch (e) {}
//     const prismaSchemaSource = toPrismaSchemaString(model.domainModel!);
//     const result = await deploy(prismaSchemaSource, undefined, false, true);
//     res.status(200).json(result);
//   } catch (e) {
//     next(e);
//   }
// });

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
