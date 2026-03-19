import express from 'express'
import dependencies from '../Dependencies/Dependencies.js'
import authorize from '../../../shared/middlewares/authorize.js'
import authentiate from '../../../shared/middlewares/authentictate.js'
import  validate from '../../shared/middlewares/validate.js'
import requestlogger from '../../../shared/middlewares/requestlogger.js'
import ResponseFormatter from '../../shared/utils/ResponseFormatter'
import { onboardsuperAdminSchema,loginSchema,registerSchema} from '../validation/authSchema.js'
import {APPLICATION_RULES} from "../../../shared/constants/role.js"

const router=express.Router()
const {controllers}=dependencies

const authcontroller=controllers.AuthController

router.post("/onboard-superadmin",
    requestlogger,
    validate(onboardsuperAdminSchema),
    (req,res,next)=>authcontroller.onboardSuperAdmin(req,res,next)
)

export default router
