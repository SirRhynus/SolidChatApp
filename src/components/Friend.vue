<script>
import { getSolidDataset, getStringNoLocale, getThing, getUrl, removeUrl, saveSolidDatasetAt, setThing } from '@inrupt/solid-client';
import { FOAF, VCARD } from '@inrupt/vocab-common-rdf';
import { SIOC } from '../modules/vocab';
import Image from './Image.vue';
export default {
    props: ['webId'],
    emits: ['remove'],
    data() {
        return {
            image: null,
            name: ''
        }
    },
    methods: {
        async remove() {
            const profileDS = await getSolidDataset(this.session.info.webId, { fetch: this.session.fetch });
            const profile = getThing(profileDS, this.session.info.webId);
            const updatedProfile = removeUrl(profile, FOAF.knows, this.webId);
            const updatedProfileDS = setThing(profileDS, updatedProfile);
            await saveSolidDatasetAt(this.session.info.webId, updatedProfileDS, { fetch: this.session.fetch });
            this.$emit('remove');
        }
    },
    async created() {
        const profile = getThing(await getSolidDataset(this.webId), this.webId);
        this.image = getUrl(profile, SIOC.avatar) || getUrl(profile, VCARD.hasPhoto) || getUrl(profile, FOAF.img);
        this.name = getStringNoLocale(profile, VCARD.fn) || getStringNoLocale(profile, FOAF.name);
    },
    components: { Image }
}
</script>
<template>
<div class="friend">
    <Image :src="image"/>
    <h3>{{ name }}</h3>
    <button class="delete" @click="remove">&#10060;</button>
</div>
</template>
<style>
.friend {
    padding: 2rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.friend > .delete {
    border: none;
    background-color: inherit;
}

.friend > .delete:hover {
    cursor: pointer;
}

</style>