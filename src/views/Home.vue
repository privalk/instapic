<template>
    <v-container fluid class="container">
        <img src="/Home/Ads_Left.svg" class="Ads_Left" />
        <img src="/Home/Body.png" @click="ClickToStart"></img>
        <img src="/Home/Ads_Right.svg" class="Ads_Right" />
    </v-container>
</template>

<script lang="ts">

import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { useJourneyStore } from '@/stores/journey';
import { defineComponent, onMounted } from 'vue';


export default defineComponent({

    setup() {
        const authStore = useAuthStore();
        const journeyStore = useJourneyStore();
        const ClickToStart = async () => {

            await journeyStore.JourneyCreation();

            router.push({ name: 'GridSelect' });
            // router.push({ name: 'BeautyFilter' });

        };

        onMounted(async () => {

            await authStore.DeviceCreation();
            await authStore.ServiceInquiry();
            await authStore.GoodInquiry();
            await authStore.SpecificationInquiry();
            journeyStore.init();

        });
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