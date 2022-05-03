<script>
import { getSolidDataset, getThing, getStringEnglish, getUrl } from "@inrupt/solid-client";
import { FOAF, VCARD } from "@inrupt/vocab-common-rdf";
import Loading from "./Loading.vue";
export default {
    props: ["webID"],
    data() {
        return {
            name: null,
            photo: null
        };
    },
    async beforeCreate() {
        const profileDataset = await getSolidDataset(this.webID);
        const profile = getThing(profileDataset, this.webID);
        this.name = getStringEnglish(profile, FOAF.name);
        this.photo = getUrl(profile, FOAF.img);
    },
    components: { Loading }
}
</script>
<template>
<div id="profile">
    <img height="75" :src="photo">
    <Loading v-if="name === null" />
    <p>{{ name ? name : webID }}</p>
</div>
</template>
<style>
#profile {
    display: flex;
    flex-direction: row;
    align-items: center;
}
#profile > p {
    margin: 1rem;
}
</style>