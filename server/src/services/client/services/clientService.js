import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";
import { APPLICATION_ROLES, isValidClientRole } from "../../../shared/constants/role.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto"

export class clientService {
  constructor(dependencies) {
    if (!dependencies) {
      throw new Error("Dependencies are required");
    }
    if (!dependencies.clientRepository) {
      throw new Error("Clientrepository is  required");
    }

    if (!dependencies.apiKeyRepository) {
      throw new Error("ApikeyRepository is required");
    }

    if (!dependencies.userRepository) {
      throw new Error("UserRepository is required");
    }

    this.clientRepository = dependencies.clientRepository;
    this.apiKeyRepository = dependencies.apiKeyRepository;
    this.userRepository = dependencies.userRepository;
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

  generateSlug(name) {
    return name
      .toLocaleLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim(); //AMAZON-WEB-SERVICE=>amazon-web-service
  }

  async createClient(clientData, adminUser) {
    try {
      const { name, email, description, website } = clientData;
      const slug = this.generateSlug(name);

      const existingClient = await this.clientRepository.findBySlug(slug);
      if (existingClient) {
        throw new AppError(`Client with slug ${slug} already exists`, 400);
      }

      const client = await this.clientRepository.create({
        name,
        slug,
        email,
        description,
        website,
        createdBy: adminUser.userId,
      });

      return client;
    } catch (error) {
      logger.error("Error creating client", error);
      throw error;
    }
  }

  canUserAccessclient(user, clientId) {
    if(user.role===APPLICATION_ROLES.SUPER_ADMIN){
        return true
     }

     return user.clientId && user.clientId.toString() === clientId.toString()
    }
  

  async createClientUser(clientId, userData, adminUser) {
    try {
        if(!this.canUserAccessclient(adminUser,clientId))
        {
            throw new AppError("Access denied",403)
        }

        const {username,email,password,role=APPLICATION_ROLES.CLIENT_VIEWER}=userData

        if(!isValidClientRole(role))
        {
            throw new AppError("Invalid client role",400)
        };

        const client=await this.clientRepository.findById(clientId)
        if(!client)
        {
            throw new AppError("Client not found",404)
        }

        let permissions={
            canCreateApiKeys:false,
            canManageUsers:false,
            canViewAnalytics:true,
            canExportData:false

        }

        if(role===APPLICATION_ROLES.CLIENT_ADMIN)
        {
            permissions={
                canCreateApiKeys:true,
                canManageUsers:true,
                canViewAnalytics:true,
                canExportData:true
            }
        }

        const existingUser=await this.userRepository.findByEmail(email)
        if(existingUser)
        {
            throw new AppError("Email already in use",400)
        }

        const newuser=await this.userRepository.create({
            username,
            email,
            password,
            role,
            clientId,
            permissions
        })
        logger.info("Client user created in MongoDB",{
            ClientId:newuser._id,
            email:newuser.email,
            role:newuser.role,
            clientId:newuser.clientId
        })

        return this.formatClientForResponse(newuser)

    } catch (error) {
        logger.error("Error creating client user", error);
        throw error;
    }
  }

  generateApiKeyValue()
  {
    //snowflake id generation or UUID
    const prefix="api_"
    const randomString=crypto.randomBytes(32).toString("hex") //64 characters
    return prefix+randomString
  }

  async createApiKey(clientId, apiKeyData, adminUser) {
    try {
        const client=await this.clientRepository.findById(clientId)
        if(!client)
        {
            throw new AppError("Client not found",404)
        }

        if(!this.canUserAccessclient(adminUser,clientId))
        {
            throw new AppError("Access denied",403)
        }
        if (
            adminUser.role !== APPLICATION_ROLES.CLIENT_ADMIN &&
            adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN
        )
        {
            throw new AppError("Access denied-only for admin and client-admin can create API-keys ",403)
        };

        const {name,description,environment="production"}=apiKeyData

        const keyId=uuidv4();
        console.log("Generated API key ID:", keyId);

        const keyValue=this.generateApiKeyValue();
        console.log("Generated API key value:", keyValue);

         const apiKey = await this.apiKeyRepository.create({
            keyId,
            keyValue,
            clientId,
            name,
            description,
            environment,
            createdBy: adminUser.userId
        });

        console.log("API key created in MongoDB with ID:", apiKey._id);

        return apiKey
    } catch (error) {
        logger.error("Error creating API key", error);
        throw error;
    }
  }
  async getApiKeys(clientId, user) {
    try {
        const client=await this.clientRepository.findById(clientId)
        if(!client)
        {
            throw new AppError("Client not found",404)
        }

        if(!this.canUserAccessclient(user,clientId))
        {
            throw new AppError("Access denied",403)
        }
        const apiKeys=await this.apiKeyRepository.findByClientId(clientId)
         //exclude key value from response
        const formattedApiKeys=apiKeys.map(apiKey=>{
            const apikeyObject=apiKey.toObject ? apiKey.toObject() : {...apiKey}
            delete apikeyObject.keyValue
            return apikeyObject
        }
        )
        return formattedApiKeys
    } catch (error) {
        logger.error("Error fetching API keys", error);
        throw error;
    }

}
}
