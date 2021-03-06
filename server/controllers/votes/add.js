const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// services
const getVotes = require("../../services/votes/getVotes");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
	const userId = req.user.userId;
	const permissions = req.user.permissions;

	const postId = req.body.postId;

	const checkPermission = permissions.find(item => item === "vote:create");
	if (!checkPermission) {
		return res.status(403).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	try {
		const vote = await database
			.select()
			.from("votes")
			.where({
				postId: postId || null,
				userId
			})
			.first();

		if (vote) {
			return res.status(404).send({
				message: error.api.votes.exists,
				code: "VOTE_EXISTS"
			});
		}

		await database
			.insert({
				voteId: uuidv4(),
				userId,
				postId
			})
			.into("votes");

		const voters = await getVotes(postId, userId);

		res.status(201).send({ voters });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
