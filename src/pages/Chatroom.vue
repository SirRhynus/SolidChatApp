<script>
import { asUrl, getDatetime, getStringEnglish, getStringNoLocale, getUrl } from "@inrupt/solid-client"
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import { SIOC } from "../modules/vocab";
import { getChatMessageAllFrom } from "../modules/chatappExplorationFunctions";
import { postChatMessage } from "../modules/chatappCreationFunctions";
import ChatMessage from "../components/ChatMessage.vue";

export default {
    props: ['chatroom'],
    data() {
        return {
            title: getStringEnglish(this.chatroom, DCTERMS.title),
            creator: getUrl(this.chatroom, DCTERMS.creator),
            created: getStringNoLocale(this.chatroom, DCTERMS.created),
            url: asUrl(this.chatroom),
            messages: [],
            currentMessage: ''
        }
    },
    methods: {
        copyOnClick(e) {
            e.srcElement.classList.add('clicked');
            navigator.clipboard.writeText(this.url);
            setTimeout(() => e.srcElement.classList.remove('clicked'), 3000);
        },
        async sendMessage() {
            const messageThing = await postChatMessage(this.session.info.webId, this.currentMessage, this.chatroom, { fetch: this.session.fetch });
            this.messages.push(this.messageThingToMessage(messageThing));
        },
        messageThingToMessage(messageThing) {
            const message = {};
            message.url = asUrl(messageThing);
            message.author = getUrl(messageThing, SIOC.has_creator);
            message.created = getDatetime(messageThing, DCTERMS.created);
            message.content = getStringEnglish(messageThing, SIOC.content);
            return message;
        }
    },
    async created() {
        this.messages = (await getChatMessageAllFrom(this.chatroom, { fetch: this.session.fetch })).map(this.messageThingToMessage);//.sort((a, b) => (new Date(a.created) - new Date(b.created)));
    },
    components: { ChatMessage }

}
</script>
<template>
<div class="chatroom">
    <header>
        <h2>{{ title }}</h2>
        <p data-tooltip="Click to copy" @click="copyOnClick">{{ url }}</p>
    </header>
    <section>
        <ol>
            <li v-for="message in messages">
                <ChatMessage :message="message" />
            </li>
        </ol>
        <div>
            <input v-model="currentMessage">
            <button @click="sendMessage">
                <svg viewBox="0 0 200 100">
                    <polygon points="0,0 200,50 0,100 0,0" class="send"></polygon>
                </svg>
            </button>
        </div>
    </section>
</div>
</template>
<style>
.chatroom {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chatroom > header {
    border: 2px solid black;
}

.chatroom > header > p[data-tooltip] {
    text-decoration: dotted underline;
    transition: unset;
}

.chatroom > header > p[data-tooltip]:hover {
    cursor: pointer;
}

.chatroom > header > p[data-tooltip].clicked {
    font-weight: bold;
}

.chatroom > header > p[data-tooltip].clicked::after {
    content: 'Copied!';
}

.chatroom > section {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2rem;
}


.chatroom > section > ol {
    list-style: none;
    flex-grow: 1;
}

.chatroom > section > div {
    width: 90%;
    height: 2rem;
    padding: 2px;
    border: 1px solid blue;
    border-radius: 10px;
}

.chatroom > section > div > input {
    width: 90%;
    border: none;
    outline: none;
    height: 85%;
}

.chatroom > section > div > button {
    border: none;
    background: none;
}

.chatroom > section > div > input:focus {
    outline: none !important;
}

.chatroom > section > div:focus-within {
    outline: 2px solid blue;
}

.chatroom > section > div > button {
    width: 10%;
    height: 90%;
}

.chatroom > section > div > button > svg {
    height: 80%;
    width: 100%;
}

.send {
    fill: lightblue;
    stroke: darkblue;
    stroke-width: 3px;
}

</style>