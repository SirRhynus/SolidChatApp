<script>
export default {
    props: {
        size: {
            type: String,
            default: '16px'
        }
    }
}
</script>
<template>
<div class="loader" ></div>
</template>
<style>
.loader {
    border: calc(v-bind(size) / 8) solid #f3f3f3;
    border-top: calc(v-bind(size) / 8) solid #3498db;
    border-radius: 50%;
    width: v-bind(size);
    height: v-bind(size);
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>