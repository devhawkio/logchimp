<template>
	<div>
		<div v-if="boards.length > 0" class="boards-lists">
			<router-link
				:to="`/board/${board.url}`"
				v-for="board in boards"
				:key="board.boardId"
				class="boards-item"
			>
				<div
					class="board-color boards-item-color"
					:style="{
						backgroundColor: `#${board.color}`
					}"
				/>
				<div class="boards-item-name-and-posts">
					<div class="boards-item-name">
						{{ board.name }}
					</div>
					<div class="boards-item-posts">
						{{ board.post_count }}
					</div>
				</div>
			</router-link>
		</div>
		<infinite-loading @infinite="getBoards">
			<div class="loader-container" slot="spinner"><loader /></div>
			<div slot="no-more"></div>
			<div slot="no-results"></div>
			<div slot="error"></div>
		</infinite-loading>
	</div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getAllBoards } from "../modules/boards";

// components
import Loader from "../components/Loader";

export default {
	name: "Boards",
	data() {
		return {
			boards: [],
			page: 1
		};
	},
	components: {
		// packages
		InfiniteLoading,

		// components
		Loader
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		async getBoards($state) {
			try {
				const response = await getAllBoards(this.page, null, "desc");

				if (response.data.length) {
					this.boards.push(...response.data);
					this.page += 1;
					$state.loaded();
				} else {
					$state.complete();
				}
			} catch (error) {
				console.error(error);
				$state.error();
			}
		}
	},
	metaInfo() {
		return {
			title: "Boards",
			meta: [
				{
					name: "og:title",
					content: `Boards · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
