<template>
	<div class="post">
		<Vote
			:post-id="postData.postId"
			:votes-count="postData.voters.votesCount"
			:is-voted="postData.voters.viewerVote"
			@update-voters="updateVoters"
		/>
		<div class="post-content">
			<router-link
				class="post-content-link"
				:to="`${dashboardUrl}/post/${postData.slug}`"
			>
				<h5 class="post-content-title">{{ postData.title }}</h5>
			</router-link>
			<p class="post-content-description" v-html="sliceContentMarkdown" />
			<router-link
				:to="`${dashboardUrl}/board/${postData.board.url}`"
				v-if="showBoard && post.board"
			>
				<div class="post-board">
					<div
						class="board-color"
						:style="{
							backgroundColor: `#${postData.board.color}`
						}"
					/>
					<div class="post-board-name">
						<p>{{ postData.board.name }}</p>
					</div>
				</div>
			</router-link>
		</div>
	</div>
</template>

<script>
// components
import Vote from "./Vote";

export default {
	name: "post",
	props: {
		post: {
			type: Object,
			required: true,
			default: () => {}
		},
		dashboard: {
			type: Boolean,
			default: false
		},
		showBoard: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			postData: this.post
		};
	},
	components: {
		Vote
	},
	watch: {
		post: {
			handler(newValue) {
				this.postData = newValue;
			}
		}
	},
	computed: {
		sliceContentMarkdown() {
			if (this.post.contentMarkdown) {
				return (
					this.post.contentMarkdown.slice(0, 120) +
					(this.post.contentMarkdown.length > 120 ? "..." : "")
				);
			} else {
				return "";
			}
		},
		dashboardUrl() {
			return this.dashboard ? "/dashboard" : "";
		}
	},
	methods: {
		updateVoters(voters) {
			this.postData.voters.votesCount = voters.votesCount;
			this.postData.voters.viewerVote = voters.viewerVote;
		},
	},
};
</script>
