import { ApiHitRepository } from "../repositories/ApiHitRepository.js";
import { MetricsRepository } from "../repositories/MetricsRepository.js";
import {ProcessorService} from "../services/ProcessorService.js";

import ApiHit from '../../../shared/models/Apihits.js'
import postgres from '../../../shared/config/postgres.js';
import logger from '../../../shared/config/logger.js';

class container{
    static init()
    {
        const repositories={
            ApiHitRepository:new ApiHitRepository({model:ApiHit,logger}),
            MetricsRepository:new MetricsRepository({postgres,logger})
        }

        const processorService=
        {
            processorService:new ProcessorService({repositories})
        }



        return {repositories,processorService};
    }
}

const initialized=container.init();
export {container}
export default initialized;
