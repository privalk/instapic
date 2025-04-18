<template>
    <v-container fluid class="container">
        <img src="/Home/Ads_Left.svg" class="Ads_Left" />
        <img src="/Home/Body.svg" @click="ClickToStart"></img>
        <img src="/Home/Ads_Right.svg" class="Ads_Right" />
    </v-container>
</template>

<script lang="ts">
import router from '@/router';
import { defineComponent } from 'vue';


export default defineComponent({
   
    setup() {
        const ClickToStart = () => {
            router.push({ name: 'GridSelect' });
        };
        return { ClickToStart };
    },
});
</script>

<style scoped>
.container {
    width: 100%;
    height: 100%;
    background: linear-gradient(119deg, #E8E8E8 0%, #FFFFFF 21%, #E1E1E1 54%, #FFFFFF 97%);
    padding: 80px 85px;
    display: flex;
}

.Ads_Left {

    width: 250px;
    height: 920px;

}

.Ads_Right {

    width: 250px;
    height: 920px;

}

.Body {

    width: 1250px;
    height: 920px;

}
</style>