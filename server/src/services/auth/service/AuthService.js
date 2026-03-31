import AppError from "../../../shared/utils/AppError.js";
import config from "../../../shared/config/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import logger from "../../../shared/config/logger.js";
import { APPLICATION_ROLES } from "../../../shared/constants/role.js";

export class AuthService{
    constructor(userRepository)

    {
        if(!userRepository)
        {
            throw new Error("UserRepository is required")
        }
        this.userRepository=userRepository
    }

    generateToken(user)
    {
     const {_id,email,username,role,clientId}=user;
     const payload={
       userId:_id,
       username,
        email,
        role,
        clientId        
    }
     return jwt.sign(payload,config.jwt.secret,{
        expiresIn:config.jwt.expiresIn
     })
}

    /**
     * Onboards a Super Admin user if none exists in the system.
     * 
     * This method checks if any users already exist in the repository. If a user exists,
     * it throws an error to prevent multiple Super Admins from being onboarded. If no users exist,
     * it creates a new Super Admin user, generates an authentication token, logs the onboarding event,
     * and returns the formatted user data along with the token.
     *
     * @async
     * @param {Object} superAdminData - The data required to create the Super Admin user.
     * @returns {Promise<{user: Object, token: string}>} The onboarded Super Admin's formatted data and authentication token.
     * @throws {AppError} If a Super Admin already exists in the system.
     */


    async onboardSuperAdmin(superAdminData)
    {
        try {
            const existingUser=await this.userRepository.findAll();
            //if super admin already exist then return the existing super admin
            if(existingUser && existingUser.length>0)
            {
                throw new AppError("Super Admin onboarding is disabled",403)
            }
            
            const user=await this.userRepository.create(superAdminData)
            const token=this.generateToken(user)

            logger.info("Super Admin onboarded successfully", { username: user.username });
            return {user:this.formatUserForResponse(user),token}
            
        } catch (error) {
           logger.error("Error onboarding Super Admin", error);
           throw error
        }
    }

    formatUserForResponse(user) {
        if (!user) {
            return null;
        }

        const userobject = user.toObject ? user.toObject() : { ...user };
        delete userobject.password;
        return userobject;
    }

    comparePassword(EnteredPassword,hashedPassword)
    {
        return bcrypt.compare(EnteredPassword,hashedPassword)
    }


    async register(userData)
    {
        try {
            const existingUser=await this.userRepository.findByUsername(userData.username)
            if(existingUser)
            {
                throw new AppError("User with this username already exists",409)
            }

            const user=await this.userRepository.create(userData)
            const token=this.generateToken(user)

            logger.info("User registered successfully", { username: user.username });
            return {user:this.formatUserForResponse(user),token}
        } catch (error) {
            logger.error("Error registering user", error);
            throw error
        }
    }

    async login(username,password)
    {
        try {
            const user=await this.userRepository.findByUsername(username)
            if(!user)
            {
                throw new AppError("Invalid username or password",401)
            }

            if(!user.isActive)
            {
                throw new AppError("User account is deactivated",403)
            }

            const isPassworvalid=await this.comparePassword(password,user.password)
            if(!isPassworvalid)
            {
                throw new AppError("Invalid username or password",401)
            }

            logger.info("User logged in successfully", { username: user.username });
            const token=this.generateToken(user)
            return {user:this.formatUserForResponse(user),token}

        } catch (error) {
            logger.error("Error logging in user", error);
            throw error
        }
    }

    async getProfile(userId)
    {
        try {
            const user=await this.userRepository.findById(userId)
            if(!user)
            {
                throw new AppError("User not found",404)
            }
            return this.formatUserForResponse(user)
        } catch (error) {
            next(error)
        }
    }

   

    async checkSuperAdminPermissions(userId)
    {
        try {
            const user=await this.userRepository.findById(userId)
            if(!user)
            {
                throw new AppError("User not found",404)
            }

            return user.role ===APPLICATION_ROLES.SUPER_ADMIN
        } catch (error) {
                throw error
        }
    }
}

