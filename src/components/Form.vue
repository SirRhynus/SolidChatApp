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
<div class="overlay">
    <form class="fixed">
        <slot>
            <textarea>Just an empty form for now.</textarea>    
        </slot>
        <div class="row">
            <button @click="e => { e.preventDefault(); $emit('submit'); }">Submit</button>
            <button @click="e => { e.preventDefault(); $emit('cancel'); }">Cancel</button>
        </div>
    </form>
</div>
</template>
<style>
.overlay {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    background: #0000003b;
    z-index: 80;
}

form.fixed {
    position: fixed;
    left: 50%;
    top: 50%;
    border: 1px solid black;
    border-radius: 1rem;
    transform: translate(-50%, -50%);
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    z-index: 99;
}

form.fixed > * {
    margin: 5px;
}

form.fixed .row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}
</style>