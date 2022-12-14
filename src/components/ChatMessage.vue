<script>
import { getDatetime, getLiteral, getSolidDataset, getStringEnglish, getStringNoLocale, getThing, getUrl } from '@inrupt/solid-client'
import { FOAF, VCARD, DCTERMS } from '@inrupt/vocab-common-rdf';
import { SIOC } from '../modules/vocab';
import { DateTime } from 'luxon';
import Image from './Image.vue';

export default {
    props: ["message"],
    data() {
        return {
            author: {
                thing: null,
                name: "",
                image: null
            }
        };
    },
    async created() {
        const authorDS = await getSolidDataset(this.message.author, { fetch: this.session.fetch });
        this.author.thing = getThing(authorDS, this.message.author);
        this.author.name = getStringEnglish(this.author.thing, FOAF.nick) || getStringNoLocale(this.author.thing, FOAF.nick) ||
            getStringEnglish(this.author.thing, VCARD.fn) || getStringNoLocale(this.author.thing, VCARD.fn) ||
            getStringEnglish(this.author.thing, FOAF.name) || getStringNoLocale(this.author.thing, FOAF.name);
        this.author.image = getUrl(this.author.thing, SIOC.avatar) || getUrl(this.author.thing, VCARD.hasPhoto) || getUrl(this.author.thing, FOAF.img);
    },
    computed: {
        formattedCreated() {
            return DateTime.fromJSDate(this.message.created).toLocaleString(DateTime.DATETIME_SHORT);
        }
    },
    components: { Image }
}
</script>
<template>
    <template v-if="message.author === session.info.webId">
    <div class="message right">
        <div>
            <p><b>{{ author.name }}</b> <em>{{ formattedCreated }}</em></p>
            <p>{{ message.content }}</p>
        </div>
        <Image :src="author.image" size="80"/>
    </div>
</template>
<template v-else>
    <div class="message left">
        <Image :src="author.image" size="80" :data-tooltip="message.author"/>
        <div>
            <p><b :data-tooltip="message.author">{{ author.name }}</b> <em>{{ formattedCreated }}</em></p>
            <p>{{ message.content }}</p>
        </div>
    </div>
</template>
</template>
<style>
.message {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0.3rem 0;
}

.message.right {
    float: right;
    clear: both;
}

.message.left {
    float: left;
    clear: both;
}

.message > div {
    display: flex;
    flex-direction: column;
}

.message.left > div {
    align-items: flex-start;
}

.message.right > div {
    align-items: flex-end;
}

.message > div > * {
    margin: 0 0.5rem;
}

.message > div > p:first-child > em {
    font-size: smaller;
}

.message > div > p:last-child {
    border: 1px solid darkblue;
    border-radius: 10px;
    padding: 0.5rem 2rem;
}
</style>