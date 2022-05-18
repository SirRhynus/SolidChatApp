<script>
import { getSolidDataset, getStringNoLocale, getThing, getUrl, getUrlAll } from "@inrupt/solid-client"
import { FOAF, VCARD } from "@inrupt/vocab-common-rdf";
import { SIOC } from "../modules/vocab";
import Editable from "../components/Editable.vue";
import ProfileImageChanger from "../components/ProfileImageChanger.vue";
import { updateString } from "../modules/profileFunctions";

export default {
    data() {
        return {
            name: null,
            nickname: null,
            image: null,
            friends: [],
            showImageForm: false,
            editName: false,
            editNickname: false
        };
    },
    created() {
        this.updateProfile();
    },
    methods: {
        async updateProfile() {
            const profileDataset = await getSolidDataset(this.session.info.webId, {
                fetch: this.session.fetch
            });
            const profile = getThing(profileDataset, this.session.info.webId);
            this.name = getStringNoLocale(profile, VCARD.fn) || getStringNoLocale(profile, FOAF.name);
            this.nickname = getStringNoLocale(profile, FOAF.nick);
            this.image = getUrl(profile, SIOC.avatar) || getUrl(profile, VCARD.hasPhoto) || getUrl(profile, FOAF.img);
            this.friends = getUrlAll(profile, FOAF.knows);        
        },
        async submitName(e) {
            await updateString(this.session.info.webId, VCARD.fn, this.name, { fetch: this.session.fetch });
        },
        async submitNick(e) {
            const ds = await updateString(this.session.info.webId, FOAF.nick, this.nickname, { fetch: this.session.fetch });
        }
    },
    components: { Editable, ProfileImageChanger }
}
</script>
<template>
<div class="profile-info">
    <div class="col">
        <h2 title="name" class="editable" data-tooltip="Click to edit"><input v-model="name" @focusout="submitName"></h2>
        <div class="row">
            <label>Nickname: </label>
            <p title="nickname" class="editable" data-tooltip="Click to edit"><input v-model="nickname" @focusout="submitNick"></p>
        </div>
    </div>
    <Editable @edit="showImageForm = true"><img width="100" height="100" :src="image"></Editable>
</div>
<ProfileImageChanger v-if="showImageForm" @submit="showImageForm = false; updateProfile();" @cancel="showImageForm = false"/>
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

    .row {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        justify-content: flex-start;
    }
</style>