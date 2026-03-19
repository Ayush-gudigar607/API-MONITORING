import { validate } from "uuid";
import { isValidRole } from "../../../shared/constants/role.js";

export const onboardsuperAdminSchema={
    username:{
        required:true,
    },
    email:{
        required:true,
    },
    password:{
        required:true,
        minLength:6,
    },
}

export const registerSchema={
    username:{
        required:true,
    },
    email:{
        required:true,
    },
    password:{
        required:true,
        minLength:6,
    },
        role:{
            required:true,
            validate: (value) => {
                if(!value) return null
                return isValidRole(value)? null: "Invalid Role";
            }
        }
    }

    export const loginSchema={
        username:{required:true},
        password:{required:true}
    }
    