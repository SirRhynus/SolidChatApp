<script>
import { getSolidDataset, getThing, getUrl } from "@inrupt/solid-client";
import { FOAF, VCARD } from "@inrupt/vocab-common-rdf";
import NewButton from "../components/NewButton.vue"
export default {
    data() {
        return {
            size: 80,
            image: null,
            chatrooms: ["Room 1", "Room 2", "Room 3"],
            console: console
        };
    },
    async beforeCreate() {
        const ds = await getSolidDataset(this.session.info.webId, {
            fetch: this.session.fetch
        });
        const profile = getThing(ds, this.session.info.webId);
        this.image = getUrl(profile, "http://rdfs.org/sioc/ns#avatar") || getUrl(profile, VCARD.hasPhoto) || getUrl(profile, FOAF.img);
    },
    components: { NewButton }
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
            <a><h2>{{ chatroom }}</h2></a>
        </li>
    </ul>
    <NewButton @click="console.log">
        <h3>Create</h3>
        <h3>Add</h3>
    </NewButton>
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