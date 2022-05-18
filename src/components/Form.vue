<script>
export default {
    emits: ['submit', 'cancel'],
    mounted() {
        setTimeout(() => window.addEventListener('click', e => {
            this.$emit('cancel');
        }), 0);
        this.$el.addEventListener('click', e => {
            e.stopPropagation();
        })
    }
}
</script>
<template>
<form class="fixed">
    <slot>
        <textarea>Just an empty form for now.</textarea>    
    </slot>
    <div class="row">
        <button @click="e => { e.preventDefault(); $emit('submit'); }">Submit</button>
        <button @click="e => { e.preventDefault(); $emit('cancel'); }">Cancel</button>
    </div>
</form>
</template>
<style>
form.fixed {
    position: fixed;
    left: 50%;
    top: 50%;
    border: 1px solid black;
    transform: translate(-50%, -50%);
    background-color: white;
    z-index: 99;
}

.row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}
</style>