import BaseRepository from "./BaseRepository.js";
import User from "../../../shared/models/User.js";
import logger from "../../../shared/config/logger.js";
//why i add mongodb because i future i can change the postgress also
class MongoUserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async create(userdata) {
    try {
      let data = { ...userdata };
      if (data.role == "super_admin " && !data.permissions) {
        data.permissions = {
          canCreateApiKeys: true,
          canManageUsers: true,
          CanViewAnalytics: true,
          canExportData: true,
        };
      }

      const user = new this.model(data);
      await user.save();

      logger.info("user created ", { username: user.username });
      return user;
    } catch (error) {
      logger.info("Error creating user", error);
      throw error;
    }
  }

  //findById
  async findById(id)
  {
    try {
        const user=await this.model.findById(id)
        return user
    } catch (error) {
        logger.info("Error finding user with Id", error);
        throw error;
    }
  }

  async findByUsername(username)
  {
    try {
        const user=await this.model.findOne({
            username:username
        })
        return user
    } catch (error) {
        logger.info("Error finding user By username", error);
        throw error;
    }
  }

  //find by email
  async findByEmail(email)
  {
    try {
        const user=await this.model.findOne({email:email})
        return user
    } catch (error) {
        logger.error("Error finding user By Email", error);
        throw error;
    }
  }

  async findAll()
  {
    try {
        const user=await this.model.find({isActive:true}).Select("-password")
        return user
    } catch (error) {
        logger.error("Error finding all user", error);
        throw error
    }
  }
}

export default  new MongoUserRepository;
