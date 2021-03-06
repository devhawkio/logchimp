// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const getUsers = async (created, limit, page) => {
	try {
		const users = await database
			.select(
				"userId",
				"name",
				"username",
				"avatar",
				"isVerified",
				"isOwner",
				"isModerator",
				"isBlocked"
			)
			.from("users")
			.limit(limit)
			.offset(limit * page)
			.orderBy([
				{
					column: "createdAt",
					order: created
				}
			]);

		return users;
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = getUsers;
