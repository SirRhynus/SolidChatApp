<script>
import { getSolidDataset, getStringNoLocale, getThing, getUrl, getUrlAll } from "@inrupt/solid-client"
import { FOAF, VCARD } from "@inrupt/vocab-common-rdf";
import { SIOC } from "../modules/vocab";
import Editable from "../components/Editable.vue";

export default {
    data() {
        return {
            name: null,
            nickname: null,
            image: null,
            friends: []
        };
    },
    async beforeCreate() {
        const profileDataset = await getSolidDataset(this.session.info.webId, {
            fetch: this.session.fetch
        });
        const profile = getThing(profileDataset, this.session.info.webId);
        this.name = getStringNoLocale(profile, VCARD.fn) || getStringNoLocale(profile, FOAF.name);
        this.nickname = getStringNoLocale(profile, FOAF.nick);
        this.image = getUrl(profile, SIOC.avatar) || getUrl(profile, VCARD.hasPhoto) || getUrl(profile, FOAF.img);
        this.friends = getUrlAll(profile, FOAF.knows);
    },
    components: { Editable }
}
</script>
<template>
<div class="profile-info">
    <div class="col">
        <Editable><h2 title="name">{{ name }}</h2></Editable>
        <Editable><p title="nickname">{{ nickname }}</p></Editable>
    </div>
    <Editable><img width="100" height="100" :src="image"></Editable>
</div>
</template>
<style>
    .profile-info {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .profile-info > * {
        margin: 3rem;
    }

    .col {
        display: flex;
        flex-direction: column;
    }
</style>