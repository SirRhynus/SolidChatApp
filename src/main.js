import { handleIncomingRedirect } from '@inrupt/solid-client-authn-browser';
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

app.config.globalProperties.APP_NAME = "Solid Chat App";

handleIncomingRedirect(window.location.href)
.then(session => {
    app.config.globalProperties.session = session;
    app.mount('#app');
})
.catch(console.trace);

