<script>
export default {
    props: {
        size: {
            type: String,
            default: "50px"
        }
    },
    emits: ['click'],
    data() {
        return {
            open: false
        }
    }
}
</script>
<template>
    <div class="new-button">
        <button @click="e => { open=!open; $emit('click', e); }">
            <b>+</b>
        </button>
        <div v-if="$slots.default" :class="open ? 'active' : ''">
            <slot></slot>
        </div>
    </div>
</template>
<style>
div.new-button {
    padding: 0;
    width: 0;
    height: 0;
}

div.new-button > button {
    position: absolute;
    left: 0;
    bottom: 0;
    border: 2px solid black;
    border-radius: 50%;
    background-color: #5e95ed;
    width: v-bind(size);
    height: v-bind(size);
    padding: 0;
    z-index: 1;
}

.new-button > button > b {
    font-size: calc(v-bind(size)*0.8);
}

.new-button > button:hover {
    background-color: #5e84ed;
    cursor: pointer;
}

.new-button > div {
    position: absolute;
    left: 0;
    bottom: 0;
    padding-left: v-bind(size);
    padding-right: 1em;
    border: 2px solid black;
    border-radius: 50%;
    transform: scale(0.1, 0.2);
    overflow: hidden;
    transition: transform 1s, border-radius 1s;
    transform-origin: 10% 90%;
}

.new-button > div.active {
    border-radius: 10%;
    border-bottom-left-radius: calc(v-bind(size)/2);
    transform: scale(1, 1);
}

.new-button > div > * {
    padding: 0.3rem;
    margin: 0.3rem;
}

.new-button > div > *:hover {
    cursor: pointer;
    text-decoration: underline;
    background-color: lightgray;
}
</style>