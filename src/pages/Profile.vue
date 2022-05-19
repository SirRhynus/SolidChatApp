<script>
import { addUrl, getSolidDataset, getStringNoLocale, getThing, getUrl, getUrlAll, saveSolidDatasetAt, setThing } from "@inrupt/solid-client"
import { FOAF, VCARD } from "@inrupt/vocab-common-rdf";
import { SIOC } from "../modules/vocab";
import Editable from "../components/Editable.vue";
import ProfileImageChanger from "../components/ProfileImageChanger.vue";
import Image from "../components/Image.vue";
import { updateString } from "../modules/profileFunctions";
import Friend from "../components/Friend.vue";
import NewButton from "../components/NewButton.vue";
import Form from "../components/Form.vue";

export default {
    data() {
        return {
            name: null,
            nickname: null,
            image: null,
            friends: [],
            showImageForm: false,
            editName: false,
            editNickname: false,
            showFriendForm: false,
            friendToAdd: ''
        };
    },
    created() {
        this.updateProfile();
    },
    methods: {
        copyOnClick(e) {
            e.srcElement.classList.add('clicked');
            navigator.clipboard.writeText(this.url);
            setTimeout(() => e.srcElement.classList.remove('clicked'), 3000);
        },
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
        },
        async addFriend() {
            const ds = await getSolidDataset(this.session.info.webId, { fetch: this.session.fetch });
            const profile = getThing(ds, this.session.info.webId);
            const updatedProfile = addUrl(profile, FOAF.knows, this.friendToAdd);
            const updatedDS = setThing(ds, updatedProfile);
            await saveSolidDatasetAt(this.session.info.webId, updatedDS, { fetch: this.session.fetch });
            this.updateProfile();
        }
    },
    components: { Editable, ProfileImageChanger, Image, Friend, NewButton, Form }
}
</script>
<template>
<div class="profile">
    <div class="profile-info">
        <div class="col">
            <p data-tooltip="Click to copy" @click="copyOnClick">{{ this.session.info.webId }}</p>
            <h2 title="name" class="editable" data-tooltip="Click to edit"><input :empty="name === '' ? true : false" v-model="name" @focusout="submitName"></h2>
            <div class="row">
                <label>Nickname: </label>
                <p title="nickname" class="editable" data-tooltip="Click to edit"><input :empty="nickname === '' ? true : false" v-model="nickname" @focusout="submitNick"></p>
            </div>
        </div>
        <Editable @edit="showImageForm = true"><Image size="130" :src="image" /></Editable>
    </div>
    <hr>
    <div class="friends">
        <h2>Friends</h2>
        <ul>
            <li v-for="friend in friends" :key="friend"><Friend :web-id="friend" @remove="() => { friends = friends.filter(f => f !== friend); }"></Friend></li>
        </ul>
        <NewButton @click="showFriendForm = true"/>
    </div>
</div>

<ProfileImageChanger v-if="showImageForm" @submit="showImageForm = false; updateProfile();" @cancel="showImageForm = false"/>
<Form v-if="showFriendForm" @submit="() => { addFriend(); showFriendForm = false; }" @cancel="showFriendForm = false">
    <label>Friends WebID: </label>
    <input type="url" v-model="friendToAdd">
</Form>
</template>
<style>
    .profile {
        display: flex;
        flex-direction: column;
    }

    .profile-info {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .profile-info > * {
        margin: 1rem 3rem;
    }

    .profile-info > .col > p[data-tooltip] {
        text-decoration: dotted underline;
        transition: unset;
    }

    .profile-info > .col > p[data-tooltip]:hover {
        cursor: pointer;
    }

    .profile-info > .col > p[data-tooltip].clicked {
        font-weight: bold;
    }

    .profile-info > .col > p[data-tooltip].clicked::after {
        content: 'Copied!';
    }

    .col {
        display: flex;
        flex-direction: column;
    }

    .col p, .col h2,  .col label {
        margin: 0.5rem 0.2rem;
    }

    .col h2 {
        margin-left: 0;
    }

    .row {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        justify-content: flex-start;
    }

    .friends {
        position: relative;
        flex-grow: 1;
        border-top: 2px solid black;
    }

    .friends > h2 {
        text-decoration: underline;
    }

    .friends > ul {
        list-style: none;
        overflow-y: scroll;
    }

    .friends > .new-button {
        position: absolute;
        left: 3px;
        bottom: 3px;
    }
</style>