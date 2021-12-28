export function json_stringify(json:any, space:string, deps:number, fn?:(val:any) => any):string {
    if(json != null) {
        if(json.toJSON) {
            json = json.toJSON();
        }
        const indent1 = space.repeat(deps);
        const indent2 = space.repeat(Math.max(0, deps-1));
        if(Array.isArray(json)) {
            let buff = '[', split = '';
            for(const val of json) {
                const jv = json_stringify(val, space, deps+1, fn);
                buff += `${split}\n${indent1}${jv}`;
                split = ',';
            }
            buff += ''==split ? ']' : `\n${indent2}]`;
            return buff;
        }
        if(typeof json == 'object') {
            let buff = '{', split = '';
            for(const key in json) {
                const jk = JSON.stringify(key);
                const jv = json_stringify(json[key], space, deps+1, fn);
                buff += `${split}\n${indent1}${jk}: ${jv}`;
                split = ',';
            }
            buff += ''==split ? '}' : `\n${indent2}}`;
            return buff;
        }
    }
    return fn ? fn(json) : JSON.stringify(json);
}
