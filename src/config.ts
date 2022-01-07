export type RestApiTestingCodegenConfig = Config;

export interface Config {
    baseURL?:string
    output?:string
    format?:string
    indent?:string
    expect?:any
    headers?:string[]
    ignoreheaders?:string[]
    resourceType?:string[] /* all, document, stylesheet, image, media, font, script, texttrack, xhr, fetch, eventsource, websocket, manifest, other */
    skipheaders?:boolean
}
