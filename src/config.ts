export type RestApiTestingCodegenConfig = Config;

export interface Config {
    baseURL?:string
    output?:string
    target?:string
    space?:string
    expect?:any
    headers?:string[]
}
