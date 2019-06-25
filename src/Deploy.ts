

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

export default function deploy(typeDefines: string)  : Promise<string> {
    const url = 'http://prisma:4466/management'
    const query = `
        mutation Deploy($input: DeployInput){
            deploy($input){
                migration,
                errors,
                warnings,
            }
        }
    `
    return request(url , query,{typeDefines}).then((rep)=>{
        console.log(rep)
        return rep.toString()
    })
}