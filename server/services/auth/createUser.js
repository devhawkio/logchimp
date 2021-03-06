// modules
const { v4: uuidv4 } = require("uuid");
const md5 = require("md5");

// database
const database = require("../../database");

// services
const verifyEmail = require("../../services/auth/verifyEmail");

// utils
const { createToken } = require("../../utils/token");
const { hashPassword } = require("../../utils/password");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

// configuration
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();

/**
 * Add user to 'users' database table
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @param {object} userData - User data to create account
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @param {string} userData.name - User name
 * @returns {object|null} - Returning user data object from database or null
 */
const createUser = async (req, res, next, userData) => {
	// generate user unique indentification
	const userId = uuidv4(userData.email);

	const name = userData.name;

	// get username from email address
	const username = userData.email.split("@")[0];

	// get avatar by hashing email
	const userMd5Hash = md5(userData.email);
	const avatar = `https://www.gravatar.com/avatar/${userMd5Hash}`;

	// hash password
	const hashedPassword = hashPassword(userData.password);

	try {
		const {
			rows: [getUser]
		} = await database.raw(
			`
				SELECT EXISTS (
					SELECT * FROM users WHERE email = :email
				)
			`,
			{
				email: userData.email
			}
		);

		const userExists = getUser.exists;
		if (userExists) {
			res.status(409).send({
				message: error.middleware.user.userExists,
				code: "USER_EXISTS"
			});
			return null;
		}

		// insert user to database
		const [newUser] = await database
			.insert({
				userId,
				name,
				username,
				email: userData.email,
				password: hashedPassword,
				avatar
			})
			.into("users")
			.returning(["userId", "email", "avatar"]);

		if (newUser) {
			// assign user role
			const getRoles = await database
				.select()
				.from("roles")
				.where({
					name: "user"
				});

			const getUserRole = getRoles[0];
			await database
				.insert({
					id: uuidv4(),
					role_id: getUserRole.id,
					user_id: newUser.userId
				})
				.into("roles_users");

			// send email verification
			const domain = req.headers.origin;
			const siteUrl = req.headers.origin.split("//")[1];

			await verifyEmail(domain, siteUrl, userData.email);

			// create auth token
			const secretKey = config.server.secretKey;
			const authToken = createToken(userData, secretKey, {
				expiresIn: "2d"
			});

			return {
				authToken,
				...newUser
			};
		}

		return null;
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = createUser;
