<script setup lang="ts">
import searchAnimation from '~/public/icons8-search.json'
import textAnimation from '~/public/icons8-text.json'

defineProps<{
    currentStep: string
}>()
</script>

<template>
    <div class="overview">
        <div class="shadows">
            <span class="shadow1"></span>
            <span class="shadow2"></span>
        </div>
        <div class="icon">
            <Vue3Lottie v-if="currentStep == 'search'" :animationData="searchAnimation" />
            <Vue3Lottie v-if="currentStep == 'text'" :animationData="textAnimation" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@keyframes heartbeat {
    0%, 100% {
        transform: scale(1);
    }
    30% {
        transform: scale(1.1);
    }
    50% {
        transform: scale(1);
    }
}

.overview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;

    .shadows {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 55%;
        height: 53%;

        .shadow1,
        .shadow2 {
            background: #000;
            display: block;
            filter: blur(20px);
            opacity: 0.8;
            border-radius: 15rem;
            animation: heartbeat 1.5s ease-in-out infinite;
            position: absolute;
        }

        .shadow1 {
            background: #000;
            height: 200%;
            aspect-ratio: 1 / 0.8;
            opacity: 0.6;
            margin-right: 1rem;
        }

        .shadow2 {
            background: rgb(185, 28, 28);
            height: 180%;
            aspect-ratio: 1 / 1.3;
            margin-left: 2rem;
        }
    }

    .icon {
        width: 45%;
        height: 45%;
        color: #FFF;
        position: relative;
        z-index: 1;
    }
}
</style>