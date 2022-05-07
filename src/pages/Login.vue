<script>
import { login } from "@inrupt/solid-client-authn-browser";
export default {
    methods: {
        async loginToIssuer() {
            const issuerUri = this.$el.querySelector('input[type="url"]').value;
            await login({
                oidcIssuer: issuerUri,
                clientName: this.APP_NAME,
                redirectUrl: window.location.href
            });
        }
    }
}
</script>
<template>
<section id="login">
    <label>Login with your identity provider</label>
    <div class="row">
        <input type="url" placeholder="https://your-identity-provider" >
        <button @click="loginToIssuer">Go</button>
    </div>
</section>
</template>
<style>
.row {
    display: flex;    
    flex-direction: row;
}
</style>