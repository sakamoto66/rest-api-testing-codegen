import {json_stringify} from './util';

function hi(name: string) {
    console.log(`Hello ${name}`);
}

export interface RestApiTestingCodegenConfig {
    baseURL?:string
    output?:string
    target?:string
    space?:string
    expect?:any
    headers?:string[]
}

export default hi;