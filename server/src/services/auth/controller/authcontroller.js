import config from "../../../shared/config/index.js";
import logger from "../../../shared/config/logger.js";
import { APPLICATION_ROLES } from "../../../shared/constants/role.js";
import ResponseFormatter from "../../../shared/utils/responceFormator.js";

export class AuthController{
    constructor(authService)
    {
   if (!authService)
   {
    throw new Error("userService is required")
   }

   this.authService=authService
    };

    async onboardSuperAdmin(req,res,next)   
    {
        try {
            const {username,email,password}=req.body

            const superAdminData={
                username,
                email,
                password,
                role: APPLICATION_ROLES.SUPER_ADMIN
            };

            const {token, user} = await this.authService.onboardSuperAdmin(superAdminData);
                 
            res.cookie("token", token,{
                httpOnly:config.cookie.httpOnly,
                secure:config.cookie.secure,
                maxAge:config.cookie.expireIn
            });

            res.status(201).json(ResponseFormatter.success(user,"super admin created successfully",201))
            

        } catch (error) {
            next(error)
        }
    } ;

    async register(req,res,next)
    {
        try {
            const {username,email,password,role}=req.body
           const userData = {
    username,
    email,
    password,
    role: role || APPLICATION_ROLES.CLIENT_ADMIN
}

            const {token,user}=await this.authService.register(userData)
            res.status(201).json(ResponseFormatter.success(user,"user registered successfully",201))
        } catch (error) {
            next(error)
        }
    }

    async login(req,res,next)
    {
        try {
            const {username,password}=req.body
            const {token,user}=await this.authService.login(username,password)

            res.cookie("token", token,{
                httpOnly:config.cookie.httpOnly,
                secure:config.cookie.secure,
                maxAge:config.cookie.expireIn
            });

            res.status(200).json(ResponseFormatter.success(user,"user logged in successfully",200))
        } catch (error) {
            next(error)
        }
    }

    async getProfile(req,res,next)
    {
        try {
            const userId=req.user.userId
            const user=await this.authService.getProfile(userId)
            res.status(200).json(ResponseFormatter.success(user,"user profile fetched successfully",200))
        } catch (error) {
         next(error)   
        }
    }

    async logout(req,res,next)
    {
        try {
            res.clearCookie("token")
            res.status(200).json(ResponseFormatter.success(null,"user logged out successfully",200))
        } catch (error) {
            next(error)
        }
    }

}
