<script>
export default {
    data() {
        return {
            size: 80,
            image: "https://groep25.webdev.ilabt.imec.be/rien/profile/foto_gezicht.jpg",
            chatrooms: ["Room 1", "Room 2", "Room 3"]
        }
    },
    async beforeCreate() {

    }
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
</div>
</template>
<style>
.overview {
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
</style>