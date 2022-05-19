<script>
import { asUrl, getDatetime, getStringEnglish, getStringNoLocale, getUrl } from "@inrupt/solid-client"
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import { SIOC } from "../modules/vocab";
import { getChatMessageAllFrom, getChatMessageAllPast } from "../modules/chatappExplorationFunctions";
import { postChatMessage } from "../modules/chatappCreationFunctions";
import ChatMessage from "../components/ChatMessage.vue";
import Loading from "../components/Loading.vue";
import { DateTime } from 'luxon';

export default {
    props: ['chatroom'],
    data() {
        return {
            title: getStringEnglish(this.chatroom, DCTERMS.title),
            creator: getUrl(this.chatroom, DCTERMS.creator),
            created: getDatetime(this.chatroom, DCTERMS.created),
            url: asUrl(this.chatroom),
            messages: [],
            messageIds: new Set(),
            currentMessage: '',
            interval: null,
            _lastFetch: null,
            messagesLoaded: false
        }
    },
    computed: {
        chatroomInfo() {
            return `Created on ${DateTime.fromJSDate(this.created).toLocaleString(DateTime.DATETIME_MED)} by ${this.creator}`;
        }
    },
    methods: {
        copyOnClick(e) {
            e.srcElement.classList.add('clicked');
            navigator.clipboard.writeText(this.url);
            setTimeout(() => e.srcElement.classList.remove('clicked'), 3000);
        },
        getLastFetch() {
            const prevLastFetch = new Date(this._lastFetch);
            this._lastFetch = new Date();
            return prevLastFetch;
        },
        async sendMessage() {
            const messageThing = await postChatMessage(this.session.info.webId, this.currentMessage, this.chatroom, { fetch: this.session.fetch });
            this.currentMessage = '';
            const message = this.messageThingToMessage(messageThing);
            this.messageIds.add(message.url);
            this.messages.push(message);
        },
        messageThingToMessage(messageThing) {
            const message = {};
            message.url = asUrl(messageThing);
            message.author = getUrl(messageThing, SIOC.has_creator);
            message.created = getDatetime(messageThing, DCTERMS.created);
            message.content = getStringEnglish(messageThing, SIOC.content);
            return message;
        },
        async fetchNewMessages() {
            const lastFetch = this.getLastFetch();
            const getChatMessages = (lastFetch == null ?
                async () => { return await getChatMessageAllFrom(this.chatroom, {fetch: this.session.fetch})} :
                async () => { return await getChatMessageAllPast(lastFetch, this.chatroom, { fetch: this.session.fetch })}
            );
            (await getChatMessages())
                .map(this.messageThingToMessage)
                .filter((message) => !this.messageIds.has(message.url))
                .sort((a, b) => (new Date(a.created) < new Date(b.created) ? -1 : 1))
                .forEach((message) => { this.messages.push(message); this.messageIds.add(message.url)});
        }
    },
    async created() {
        await this.fetchNewMessages();
        this.messagesLoaded = true;
        this.interval = setInterval(this.fetchNewMessages, 5000);
        console.log();
    },
    beforeUnmount() {
        clearInterval(this.interval);
    },
    components: { ChatMessage, Loading }

}
</script>
<template>
<div class="chatroom">
    <header>
        <h2
            :data-tooltip="chatroomInfo"
        >{{ title }}</h2>
        <p data-tooltip="Click to copy" @click="copyOnClick">{{ url }}</p>
    </header>
    <section>
        <div>
            <ol>
                <li v-for="message in messages">
                    <ChatMessage :message="message" />
                </li>
            </ol>
            <Loading v-if="!messagesLoaded" class="center" size="48px" />
        </div>
        <div>
            <input v-model="currentMessage" @beforeinput="(e) => { if (e.inputType === 'insertLineBreak') sendMessage(e); }">
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
.center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.chatroom {
    height: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
}

.chatroom > header {
    border-bottom: 2px solid black;
    height: 10%;
}

.chatroom > header > * {
    margin: 7px;
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
    display: flex;
    flex-direction: column;
    height: 90%
}


.chatroom > section > div:first-child {
    position: relative;
    display: flex;
    flex-direction: column-reverse;
    padding: 2rem;
    flex-grow: 1;
    overflow-y: scroll;
}

.chatroom > section > div:first-child > ol {
    list-style: none;
}

.chatroom > section > div:last-child {
    width: 90%;
    height: 2.1rem;
    padding: 2px;
    margin: 4px auto;
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
    height: 100%;
}

.chatroom > section > div > button > svg {
    height: 80%;
    width: 100%;
}

.chatroom > section > div > button > svg:hover {
    cursor: pointer;
}

.chatroom > section > div > button > svg:hover > .send {
    fill: rgb(89, 147, 167);
}

.send {
    fill: lightblue;
    stroke: darkblue;
    stroke-width: 3px;
}

</style>