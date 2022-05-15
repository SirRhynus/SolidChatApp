import { getPodUrlAll, getProfileAll, getSolidDataset, getThing, getUrl } from '@inrupt/solid-client';
import { Session } from '@inrupt/solid-client-authn-browser';
import { createApp } from 'vue';
import App from './App.vue';
import { SOLID } from './modules/vocab';

const app = createApp(App);

app.config.globalProperties.APP_NAME = "Solid Chat App";

app.config.globalProperties.session = new Session();

app.config.globalProperties.session.handleIncomingRedirect(window.location.href)
.then(() => app.mount('#app'))
.catch(console.trace);

