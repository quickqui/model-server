

import request from 'graphql-request'



/*
input DeployInput {
  name: String!
  stage: String!
  types: String!
  dryRun: Boolean
  secrets: [String!]
  subscriptions: [FunctionInput!]
  force: Boolean
  clientMutationId: String
}

type DeployPayload {
  errors: [SchemaError!]!
  migration: Migration
  warnings: [SchemaWarning!]!
  clientMutationId: String
}

*/

export default function deploy(typeDefines: string, dryRun:Boolean = true ,force:Boolean  = false): Promise<object> {
    const url = 'http://prisma:4466/management'
    const query = `
        mutation Deploy($input: DeployInput!){
            deploy(input: $input){
                migration{
                    status
                }
                errors{
                    type,
                    field,
                    description
                }
                warnings{
                    type,
                    field,
                    description
                }
            }
        }
    `
    const queryInput = {
        types: typeDefines,
        name: "default",
        stage: "default",
        force,
        dryRun
    }
    console.log(typeDefines)
    return request(url, query, {input:queryInput}).then((rep) => {
        // console.log(rep)
        (rep as any).deploy.errors.forEach((e)=>{
            console.log(e)
        })
        return rep
    })
}