import AppError from "../../../shared/utils/AppError"

export class clientService{
    constructor(dependencies)
    {
     if(!dependencies)
     {
        throw new Error("Dependencies are required")
     }
     if(!dependencies.clientRepository)
     {
        throw new Error("Clientrepository is  required")
     }

      if(!dependencies.apiKeyRepository)
     {
        throw new Error("ApikeyRepository is required")
     }

      if(!dependencies.userRepository)
     {
        throw new Error("UserRepository is required")
     }

     this.clientRepository=dependencies.clientRepository
     this.apiKeyRepository=dependencies.apiKeyRepository
     this.userRepository=dependencies.userRepository

    }

     formatClientForResponse(user) {
        if (!user) {
            return null;
        }

        const userobject = user.toObject ? user.toObject() : { ...user };
        delete userobject.password;
        return userobject;
    }

    /**
     * 
     * @param {String} name 
     * @returns {String}
     */

    generateSlug(name)
    {
        return name.toLocaleLowerCase().replace(/[^a-z0-9\s-]/g,'')
        .replace(/\s+/g,'-')
        .replace(/-+/g,'-').
        trim() //AMAZON-WEB-SERVICE=>amazon-web-service
    }

    async createClient(clientData,adminUser)
    {
        try {
            const {name,email,description,website}=clientData
            const slug=this.generateSlug(name)

            const existingClient=await this.clientRepository.findBySlug(slug)
            if(existingClient)
            {
                throw new AppError(`Client with slug ${slug} already exists`,400)
            }

            const client=await this.clientRepository.create({
                name,
                slug,
                email,
                description,
                website,
                createdBy:adminUser.userId
            })

            return client
        } catch (error) {
            logger.error("Error creating client",error);
            throw error
        }
    }
}