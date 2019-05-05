
import { parseFromSchema, DataModel } from './DataSchema'




import * as express from "express";
import * as path from "path";
import * as fs from 'fs'
import * as shell from 'shelljs'
import * as bodyParser from 'body-parser'



const app = express();
const port = 1111; // default port to listen
    app.use(bodyParser.text());

// define a route handler for the default home page
app.get("/dataModel", (req, res) => {
    // render the index template
    const source = fs.readFileSync(__dirname + '/../datamodel.prisma').toString()
    const model: DataModel = parseFromSchema(source)
    res.status(200).json(model)
});
app.get("/dataModelFile", (req, res) => {
    const source = fs.readFileSync(__dirname + '/../datamodel.prisma').toString()
    res.status(200).send(source)
})

app.post("/deploy", (req, res) => {
    const result = shell.exec("npx prisma deploy")
    if (result.stdout.includes("export DEBUG")) {
        res.status(512).send(result.stdout)
    } else {
        res.status(202).send(result.stdout)
    }
})
app.put("/dataModelFile", (req, res) => {
    const body = req.body
    //TODO 校验
    fs.writeFileSync(__dirname + '/../datamodel.prisma', body)
    res.status(202).send(body)
})

// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});



// server.start(() => console.log('Server is running on http://localhost:4000'))

