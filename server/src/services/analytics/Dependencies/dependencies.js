import clientRepository from '../../client/repository/ClientRepository.js'
import processContainer from '../../processor/Dependencies/dependencies.js';
import authcontainer from '../../auth/Dependencies/Dependencies.js'

import { AnalyticsService } from '../services/analyticsservice.js';
import { AnalyticsController } from '../controller/analyticsController.js';
import { MetricsRepository } from '../../processor/repository/MetricsRepository.js';
import { AuthService } from '../../auth/service/AuthService.js';


class Container{
    static init()
    {
  const repositories={
    clientRepository,
    MetricsRepository:processContainer.repositories.MetricsRepository
    };

    const analyticsService=new AnalyticsService(repositories.MetricsRepository);

    const services={
        analyticsService,
        AuthService:authcontainer.services && authcontainer.services.AuthService
    }

    const analtticsController=new AnalyticsController({
        analyticsService:services.analyticsService,
        clientRepository:repositories.clientRepository,
        authService:services.AuthService
    })

    const controllers={
        analyticsController:analtticsController
    }

    return {repositories,services,controllers};
}
}

const initialized=Container.init();
export {Container}
export default initialized;