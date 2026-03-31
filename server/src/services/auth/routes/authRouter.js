import express from 'express'
import dependencies from '../Dependencies/Dependencies.js'
import validate from '../../../shared/middlewares/validate.js'
import requestlogger from '../../../shared/middlewares/requestlogger.js'
import { onboardsuperAdminSchema,loginSchema,registerSchema} from '../validation/authSchema.js'
import ResponseFormatter from '../../../shared/utils/responceFormator.js'
import authentiate from '../../../shared/middlewares/authentictate.js'


const router=express.Router()
const {controllers}=dependencies

const authcontroller=controllers.AuthController

router.get("/", (req, res) => {
    res.status(200).json(ResponseFormatter.success(
        {
            endpoints: [
                {
                    path: "/api/auth/onboard-super-admin",
                    method: "POST"
                }
            ]
        },
        "auth endpoints available"
    ))
})

router.route("/onboard-super-admin")
    .get((req, res) => {
        res.status(405).json(ResponseFormatter.error(
            "Use POST /api/auth/onboard-super-admin with username, email, and password in the request body",
            405
        ))
    })
    .post(
        requestlogger,
        validate(onboardsuperAdminSchema),
        (req,res,next)=>authcontroller.onboardSuperAdmin(req,res,next)
    )

    router.post("/register",
        requestlogger,
        validate(registerSchema),
        (req,res,next)=>authcontroller.register(req,res,next)
    )

    router.post("/login",
        requestlogger,
        validate(loginSchema),
        (req,res,next)=>authcontroller.login(req,res,next)
    )

    router.get("/profile",
        requestlogger,
        authentiate,
        (req,res,next)=>authcontroller.getProfile(req,res,next)
    )

    router.post("/logout",
        requestlogger,
        authentiate,
        (req,res,next)=>authcontroller.logout(req,res,next)
    )

export default router
