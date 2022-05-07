<script>
export default {
    emits: ['edit']
}
</script>
<template>
<div class="editable">
    <img class="pencil" src="../assets/pencil.png" @click="$emit('edit')">
    <slot />
</div>
</template>
<style>
.editable {
    position: relative;
}
.editable > .pencil {
    position: absolute;
    top: 0px;
    right: 0px;
    width: 25px;
    height: 25px;
    border: 1px solid grey;
    border-radius: 50%;
    padding: 3px;
    background: #fffa;
}
.editable > .pencil:hover {
    background: #fffd;
    cursor: pointer;
}
</style>