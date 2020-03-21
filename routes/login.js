const express = require("express");
const Joi = require("@hapi/joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");

const { User } = require("../models/users");
const router = express.Router();

router.post("/", async(req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).send("Invalid email or password!");

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send("Invalid email or password!");

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(body) {
    const schema = Joi.object({
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
            .min(10)
            .max(255)
            .required(),
        password: Joi.string().required()
    });

    return schema.validate(body);
}

module.exports = router;