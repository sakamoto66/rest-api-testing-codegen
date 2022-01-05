import { Response } from 'playwright';
import { RestApiTestingCodegenConfig } from '..';

export interface Generator {
    start(config:RestApiTestingCodegenConfig):void;
    definedHeader(hdrkey:string, hdrs:any):void;
    accept(response:Response, hdrkey:string):Promise<void>;
    end():void;
}