import { AuthController } from "../controller/authcontroller.js";
import {AuthService} from "../service/AuthService.js"
import  MongoUserRepository from "../repository/UserRepository.js"

class Container{
    static init()
    {
        const repositories={
            userRepository:MongoUserRepository
        };

        const services={
            AuthService:new AuthService(repositories.userRepository)
        }

        const controllers={
            AuthController:new AuthController(services.AuthService)
        }

        return {repositories,services,controllers}
    }
}

// Call the container initialization function immediately
// This creates all repositories, services, and controllers
const initialized = Container.init();

// Export the Container class itself
// This allows other files to manually call Container.init()
// if they want to create a fresh dependency graph
export { Container };

// Export the already initialized object as the default export
// This is usually imported directly to access controllers/services
export default initialized;

