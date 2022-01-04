export type RestApiTestingCodegenConfig = Config;

export interface Config {
    baseURL?:string
    output?:string
    format?:string
    indent?:string
    expect?:any
    headers?:string[]
}
