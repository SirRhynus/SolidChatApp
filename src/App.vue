<script setup>
import Login from './pages/Login.vue';
import Profile from './pages/Profile.vue';

</script>

<template>
<Profile v-if="session.info.isLoggedIn" :webID="session.info.webId"></Profile>
<Login v-else />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
