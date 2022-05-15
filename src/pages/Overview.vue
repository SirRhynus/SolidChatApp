<script>
import { getSolidDataset, getStringEnglish, getThing, getUrl } from "@inrupt/solid-client";
import { FOAF, VCARD, DCTERMS } from "@inrupt/vocab-common-rdf";
import { getChatroomAll } from '../modules/chatapp_functions';
import NewButton from "../components/NewButton.vue";
import Form from "../components/Form.vue";

export default {
    data() {
        return {
            size: 80,
            image: null,
            chatrooms: [],
            add_chatroom: {
                is_visible: false,
                data: {
                    url: ''
                }
            },
            create_chatroom: {
                is_visible: false,
                data: {
                    creator: this.session.info.webId,
                    name: '',
                    created: new Date()
                }
            }
        };
    },
    async beforeCreate() {
        const ds = await getSolidDataset(this.session.info.webId, {
            fetch: this.session.fetch
        });
        const profile = getThing(ds, this.session.info.webId);
        this.image = getUrl(profile, "http://rdfs.org/sioc/ns#avatar") || getUrl(profile, VCARD.hasPhoto) || getUrl(profile, FOAF.img);
        this.chatrooms = await getChatroomAll(this.session.info.webId, { fetch: this.session.fetch });
    },
    methods: {
        submit_add_chatroom() {
            console.log(this.add_chatroom.data);
            this.add_chatroom.is_visible = false;
        },
        submit_create_chatroom() {
            this.create_chatroom.data.created = new Date();
            console.log(this.create_chatroom.data);
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
    <div id="my-profile">
        <img :src="image" :width="size" :height="size">
        <h2>My Profile</h2>
    </div>
    <ul id="chatrooms">
        <li v-for="chatroom in chatrooms">
            <a><h2>{{ getTitle(chatroom) }}</h2></a>
        </li>
    </ul>
    <NewButton>
        <button @click="create_chatroom.is_visible=true">Create</button>
        <button @click="add_chatroom.is_visible=true">Add</button>
    </NewButton>
    <Form v-if="add_chatroom.is_visible" @submit="submit_add_chatroom" @cancel="add_chatroom.is_visible=false">
        <label for="url">URL: </label>
        <input type="url" name="url" v-model="add_chatroom.data.url">
    </Form>
    <Form v-if="create_chatroom.is_visible" @submit="submit_create_chatroom" @cancel="create_chatroom.is_visible=false">
        <label for="name">Chatroom name: </label>
        <input name="name" v-model="create_chatroom.data.name">
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
    float: left;
    border: 4px solid black;
    padding: 0;
    margin: 0;
}

.overview > * {
    padding: 5px;
}

#my-profile {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    border-bottom: 1px solid black;
}

#chatrooms {
    list-style: none;
}

.overview > .new-button {
    position: absolute;
    left: 3px;
    bottom: 3px;
}
</style>