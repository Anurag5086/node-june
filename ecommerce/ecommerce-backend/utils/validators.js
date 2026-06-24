const joi = require('joi')

const userRegistrationSchema = joi.object({
    name: joi.string().min(2).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
})

module.exports = {
    userRegistrationSchema
}