<script>
import { asUrl, getStringEnglish, getStringNoLocale, getUrl } from "@inrupt/solid-client"
import { DCTERMS } from "@inrupt/vocab-common-rdf"

export default {
    props: ['chatroom'],
    data() {
        return {
            title: getStringEnglish(this.chatroom, DCTERMS.title),
            creator: getUrl(this.chatroom, DCTERMS.creator),
            created: getStringNoLocale(this.chatroom, DCTERMS.created),
            url: asUrl(this.chatroom)
        }
    },
    methods: {
        copyOnClick(e) {
            e.srcElement.classList.add('clicked');
            navigator.clipboard.writeText(this.url);
            setTimeout(() => e.srcElement.classList.remove('clicked'), 3000);
        }
    }

}
</script>
<template>
<div class="chatroom">
    <header>
        <h2>{{ title }}</h2>
        <p data-tooltip="Click to copy" @click="copyOnClick">{{ url }}</p>
    </header>
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

</style>