<script>
import { getFile, getSolidDataset, getThing, getUrl } from "@inrupt/solid-client";
import { changeProfileImage } from "../modules/profileFunctions";
import { VCARD, FOAF } from "@inrupt/vocab-common-rdf";
import { SIOC } from "../modules/vocab";
import Form from "./Form.vue";
export default {
    emits: ["submit", "cancel"],
    data() {
        return {
            selectedFile: null,
            image: null
        }
    },
    methods: {
        onFileChange(e) {
            const files = e.target.files || e.dataTransfer.files;
            if (!files.length)
                return;
            this.selectedFile = files[0];
            const fr = new FileReader();
            fr.onload = () => { this.image.src = fr.result; };
            fr.readAsDataURL(this.selectedFile);
        },
        async onSubmit() {
            await changeProfileImage(this.session.info.webId, this.selectedFile, { fetch: this.session.fetch });
            this.$emit("submit");
        }
    },
    async created() {
        const profile = getThing(await getSolidDataset(this.session.info.webId, { fetch: this.session.fetch }), this.session.info.webId);
        const imageUrl = getUrl(profile, SIOC.avatar) || getUrl(profile, VCARD.hasPhoto) || getUrl(profile, FOAF.img);
        const blob = await getFile(imageUrl, { fetch: this.session.fetch });
        this.image = this.$el.querySelector('img');
        this.image.src = this.image.src || URL.createObjectURL(blob);
    },
    components: { Form }
}
</script>
<template>
<Form @submit="onSubmit" @cancel="() => $emit('cancel')">
<img width="300" height="300">
<input type="file" @change="onFileChange">
</Form>
</template>