<script>
import { login } from "@inrupt/solid-client-authn-browser";
export default {
    methods: {
        async loginToIssuer( issuerUri ) {
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
        <button @click="() => loginToIssuer($el.querySelector('input[type=url]').value)">Go</button>
    </div>
    <label>Or pick an identity provider from the list below:</label>
    <button @click="() => loginToIssuer('https://solidcommunity.net/')">Solid Community</button>
    <button @click="() => loginToIssuer('https://solidweb.org/')">Solid Web</button>
    <button @click="() => loginToIssuer('https://inrupt.net/')">Inrupt.net</button>
    <button @click="() => loginToIssuer('https://broker.pod.inrupt.com/')">pod.inrupt.com</button>
</section>
</template>
<style>
#login > .row {
    display: flex;    
    flex-direction: row;
}

#login > .row > input {
    flex-grow: 1;
}

#login > .row > * {
    height: 100%;
}

#login {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 2px;
    border: 1px solid black;
    padding: 2.5%
}

#login > * {
    width: 100%;
    height: 2rem;
    margin: 0.2rem;
}

#login > label {
    display: block;
    color: gray;
}

</style>