<template>
	<div class="auth">
		<div class="auth-form-container">
			<div class="auth-form-header">
				<router-link to="/" class="auth-form-logo site-info">
					<img
						class="site-logo"
						:src="getSiteSittings.logo"
						:alt="getSiteSittings.title"
					/>
					<h5 class="site-name">{{ getSiteSittings.title }}</h5>
				</router-link>
				<h3 class="auth-form-heading">Create your account</h3>
			</div>
			<Form class="auth-form">
				<l-text
					v-model="email.value"
					label="Email Address"
					type="email"
					name="email"
					placeholder="Email address"
					:error="email.error"
					@keyup-enter="join"
					@hide-error="hideEmailError"
				/>
				<l-text
					v-model="password.value"
					label="Password"
					type="password"
					name="password"
					placeholder="Password"
					:error="password.error"
					@keyup-enter="join"
					@hide-error="hidePasswordError"
				/>
				<div style="display: flex; justify-content: center;">
					<Button @click="join" type="primary" :loading="buttonLoading">
						Create account
					</Button>
				</div>
			</Form>
			<div class="auth-form-other">
				Already have an account?
				<router-link to="/login">Log in</router-link>
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { signup } from "../modules/auth";

// component
import Form from "../components/Form";
import LText from "../components/input/LText";
import Button from "../components/Button";

export default {
	name: "Join",
	data() {
		return {
			email: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			password: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			buttonLoading: false
		};
	},
	components: {
		Form,
		LText,
		Button
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		hideEmailError(event) {
			this.email.error = event;
		},
		hidePasswordError(event) {
			this.password.error = event;
		},
		async join() {
			if (this.buttonLoading) {
				return;
			}

			if (!(this.email.value && this.password.value)) {
				if (!this.email.value) {
					this.email.error.show = true;
					this.email.error.message = "Required";
				}

				if (!this.password.value) {
					this.password.error.show = true;
					this.password.error.message = "Required";
				}

				return;
			}

			this.buttonLoading = true;

			try {
				const response = await signup(this.email.value, this.password.value);

				this.$store.dispatch("user/login", {
					...response.data.user
				});

				if (this.$route.query.redirect) {
					this.$router.push(this.$route.query.redirect);
				} else {
					this.$router.push("/");
				}
			} catch (error) {
				if (error.response.data.code === "USER_EXISTS") {
					this.email.error.show = true;
					this.email.error.message = "Exists";
				}
			} finally {
				this.buttonLoading = false;
			}
		}
	},
	created() {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			this.$router.push("/");
		}
	},
	metaInfo() {
		return {
			title: "Join",
			meta: [
				{
					name: "og:title",
					content: `Join · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
