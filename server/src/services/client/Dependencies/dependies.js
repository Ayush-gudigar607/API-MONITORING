import MongoClientRepository from '../repository/ClientRepository.js';
import MongoApiKeyRepository from '../repository/ApiKeyRepository.js'
import MongoUserRepository from '../../auth/repository/UserRepository.js';
import {clientService} from '../services/clientService.js';
import {clientController} from '../controller/clientController.js'
import authContainer from '../../auth/Dependencies/Dependencies.js'
class container {
static init()
{
    const repositories = {
        clientRepository: MongoClientRepository,
        apiKeyRepository: MongoApiKeyRepository,
        userRepository: MongoUserRepository
    }

    const services={
        clientService:new clientService({
            clientRepository:repositories.clientRepository,
            apiKeyRepository:repositories.apiKeyRepository,
            userRepository:repositories.userRepository
        })
    }

    const controllers={
        clientController:new clientController(services.clientService,authContainer.services.AuthService)
    }

    return {repositories,services,controllers}
}
}

const initialized=container.init();
export { container };
export default initialized;