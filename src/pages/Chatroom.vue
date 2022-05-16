<script>
import { asUrl, getDatetime, getStringEnglish, getStringNoLocale, getUrl } from "@inrupt/solid-client"
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import { SIOC } from "../modules/vocab";
import { getChatMessageAllFrom } from "../modules/chatappExplorationFunctions";
import ChatMessage from "../components/ChatMessage.vue";

export default {
    props: ['chatroom'],
    data() {
        return {
            title: getStringEnglish(this.chatroom, DCTERMS.title),
            creator: getUrl(this.chatroom, DCTERMS.creator),
            created: getStringNoLocale(this.chatroom, DCTERMS.created),
            url: asUrl(this.chatroom),
            messages: []
        }
    },
    methods: {
        copyOnClick(e) {
            e.srcElement.classList.add('clicked');
            navigator.clipboard.writeText(this.url);
            setTimeout(() => e.srcElement.classList.remove('clicked'), 3000);
        }
    },
    async created() {
        this.messages = (await getChatMessageAllFrom(this.chatroom, { fetch: this.session.fetch })).map((messageThing) => {
            const message = {};
            message.url = asUrl(messageThing);
            message.author = getUrl(messageThing, SIOC.has_creator);
            message.created = getDatetime(messageThing, DCTERMS.created);
            message.content = getStringEnglish(messageThing, SIOC.content);
            return message;
        }).sort((a, b) => (new Date(a.created) - new Date(b.created)));
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
    </section>
</div>
</template>
<style>
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

.chatroom ol {
    list-style: none;
}

</style>