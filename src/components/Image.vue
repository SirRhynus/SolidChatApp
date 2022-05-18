<script>
export default {
    props: {
        src: String,
        size: {
            type: [Number, String],
            default: "80"
        }
    }
}
</script>
<template>
<img class="rounded" :src="src" :width="size" :height="size">
</template>
<style>
img.rounded {
    border: 1px solid green;
    border-radius: 50%;
}
</style>