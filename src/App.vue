<script setup>
import Login from './pages/Login.vue';
import Overview from './pages/Overview.vue';
import Profile from './pages/Profile.vue';
import Chatroom from './pages/Chatroom.vue';
</script>
<script>
import { shallowRef } from 'vue';
export default {
  data() {
    return {
      Content: shallowRef(Profile),
      props: {}
    }
  },
  methods: {
    changeChatroom(props) {
      this.Content = 'div';
      setTimeout(() => this.Content = shallowRef(Chatroom), 0);
      this.props = props;
    }
  }
}
</script>

<template>
  <template v-if="session.info.isLoggedIn">
  <Overview @chatroom="changeChatroom" @profile="Content=Profile"></Overview>
  <component :is="Content" :chatroom="props"></component>
  </template>
  <template v-else>
  <Login/>
  </template>
</template>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
}

#app > .overview {
  flex-grow: 1;
}

#app > .chatroom, #app > .profile-info {
  flex-grow: 5;
}

[data-tooltip] {
  position: relative;
}

[data-tooltip]:after {
  content: attr(data-tooltip);
  font-size: small;
  position: absolute;
  left: 50%;
  top: 100%; /* put it on the bottom */
  transform: translateX(-50%);
  background-color: black;
  color: white;
  padding: 4px;
  border-radius: 5px;
  width: max-content;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

[data-tooltip]:hover:after {
  opacity: 1;
}

div[data-tooltip]:after {
  left: 5px!important;
}
</style>
