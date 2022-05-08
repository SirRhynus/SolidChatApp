<script setup>
import Login from './pages/Login.vue';
import Overview from './pages/Overview.vue';
import Profile from './pages/Profile.vue';
</script>

<template>
<Overview v-if="session.info.isLoggedIn" ></Overview>
<Login v-else />
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
}
</style>
