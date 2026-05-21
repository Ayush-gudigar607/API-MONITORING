

class SecurityUtils {
    static PASSWORD_REQUIREMENTS={
        minlength:parseInt(process.env.PASSWORD_MIN_LENGTH) || "8",
        requireUppercase:process.env.PASSWORD_REQUIRE_UPPERCASE === "true" || "true",
        requireLowercase:process.env.PASSWORD_REQUIRE_LOWERCASE === "true" || "true",
        requireNumbers:process.env.PASSWORD_REQUIRE_NUMBERS === "true" || "true",
        requireSpecialChars:process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === "true" || "true"
    };

    /**
     * 
     * @param {string} password 
     * @returns {object} {isValid:boolean,errors:array}
     */

    static validatePassword(password)
    {
           const errors=[]
           const requiremnets=this.PASSWORD_REQUIREMENTS

           if (!password )
           {
            return {
                success:false,
                errors:["Password is required"]
            }
           }

           if(password.length < requiremnets.minlength)
           {
            errors.push(`Password must be at least ${requiremnets.minlength} characters long`)
           }

           if(requiremnets.requireUppercase && !/[A-Z]/.test(password))
              {
                errors.push("Password must contain at least one uppercase letter")
              }

              if(requiremnets.requireLowercase && !/[a-z]/.test(password))
              {
                errors.push("Password must contain at least one lowercase letter")
              }

              if (requiremnets.requireNumbers && !/[0-9]/.test(password))
              {
                errors.push("Password must contain at least one number")
              }

              if(requiremnets.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password))
              {
                errors.push("Password must contain at least one special character")
              }

              //check for weak passwords
              const weakPasswords=["password","123456","123456789","qwerty","abc123","111111","12345678","password1","12345","1234567"]

              if(weakPasswords.includes(password.toLowerCase()))
              {
                errors.push("Password is too weak")
              }

           return {
            success:errors.length === 0,
            errors,
            strength:this.calculatePasswordStrength(password)
           }
    }
}