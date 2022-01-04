import { Response } from 'playwright';
import { RestApiTestingCodegenConfig } from '..';

export interface Generator {
    start(config:RestApiTestingCodegenConfig):void;
    accept(response:Response):Promise<void>;
    end():void;
}