<script>
import { getSolidDataset, getStringEnglish, getThing, getUrl } from "@inrupt/solid-client";
import { FOAF, VCARD, DCTERMS } from "@inrupt/vocab-common-rdf";
import { SIOC } from '../modules/vocab';
import { getChatroomAll } from '../modules/chatappExplorationFunctions';
import NewButton from "../components/NewButton.vue";
import Form from "../components/Form.vue";
import { addChatroom, createChatroom } from "../modules/chatappCreationFunctions";

export default {
    emits: ['chatroom', 'profile'],
    data() {
        return {
            size: 80,
            image: null,
            chatrooms: [],
            add_chatroom: {
                is_visible: false,
                url: ''
            },
            create_chatroom: {
                is_visible: false,
                title: ''
            }
        };
    },
    async beforeCreate() {
        const ds = await getSolidDataset(this.session.info.webId, {
            fetch: this.session.fetch
        });
        const profile = getThing(ds, this.session.info.webId);
        this.image = getUrl(profile, SIOC.avatar) || getUrl(profile, VCARD.hasPhoto) || getUrl(profile, FOAF.img);
        this.chatrooms = await getChatroomAll(this.session.info.webId, { fetch: this.session.fetch });
    },
    methods: {
        async submit_add_chatroom() {
            this.chatrooms.push(await addChatroom(this.session.info.webId, this.add_chatroom.url, { fetch: this.session.fetch }));
            this.add_chatroom.is_visible = false;
        },
        async submit_create_chatroom() {
            this.chatrooms.push(await createChatroom(this.session.info.webId, this.create_chatroom.title, { fetch: this.session.fetch }));
            this.create_chatroom.is_visible = false;
        },
        getTitle(chatroom) {
            return getStringEnglish(chatroom, DCTERMS.title);
        }
    },
    components: { NewButton, Form }
}
</script>
<template>
<div class="overview">
    <div id="my-profile" @click="$emit('profile')">
        <img :src="image" :width="size" :height="size">
        <h2>My Profile</h2>
    </div>
    <ul id="chatrooms">
        <li v-for="chatroom in chatrooms" @click="$emit('chatroom', chatroom)">
            <h2>{{ getTitle(chatroom) }}</h2>
        </li>
    </ul>
    <NewButton>
        <button @click="create_chatroom.is_visible=true">Create</button>
        <button @click="add_chatroom.is_visible=true">Add</button>
    </NewButton>
    <Form v-if="add_chatroom.is_visible" @submit="submit_add_chatroom" @cancel="add_chatroom.is_visible=false">
        <label for="url">URL: </label>
        <input type="url" name="url" v-model="add_chatroom.url">
    </Form>
    <Form v-if="create_chatroom.is_visible" @submit="submit_create_chatroom" @cancel="create_chatroom.is_visible=false">
        <label for="name">Chatroom name: </label>
        <input name="name" v-model="create_chatroom.title">
    </Form>
</div>
</template>
<style>
#test {
    bottom: 100px;
}

.overview {
    position: relative;
    width: 18rem;
    height: 100vh;
    border-right: 4px solid black;
    padding: 0;
    margin: 0;
}

.overview > * {
    padding: 5px;
}

#my-profile {
    display: flex;
    height: 10%;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    border-bottom: 2px solid black;
}

#my-profile:hover {
    cursor: pointer;
}

#chatrooms {
    list-style: none;
}

#chatrooms > li {
    display: block;
}

#chatrooms > li:hover {
    border: 1px solid grey;
    cursor: pointer;
}

.overview > .new-button {
    position: absolute;
    left: 3px;
    bottom: 3px;
}
</style>