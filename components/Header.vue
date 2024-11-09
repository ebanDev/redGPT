<script setup>
const apiKeysStore = useApiKeysStore();
const { apiKeys, apiKeysUnset } = storeToRefs(apiKeysStore);
const showLogin = ref(false)
const { signIn, status: userStatus, data: userAccount } = useAuth()

onMounted(async () => {
    if (apiKeysUnset.value && userStatus.value !== 'authenticated') {
        showLogin.value = true
    }
})

const login = async () => {
    signIn('google')
}

</script>

<template>
    <div class="flex justify-between items-end w-full pb-4 my-8">
        <nuxt-link to="/">
            <h1 class="text-5xl font-bold leading-8 text-black">
            redGPT<span class="text-red-700 text-8xl leading-8">.</span>
            </h1>
        </nuxt-link>
        <div class="flex bg-[var(--ui-primary)] text-[var(--ui-bg)] rounded-md px-4 py-2 font-bold items-center gap-1"
            v-if="userAccount">
            <UIcon name="i-tabler-user-filled" />
            {{ userAccount.user.name }}
        </div>
    </div>
    <UModal v-model:open="showLogin" title="Login or use your API keys" close-icon="i-tabler-x">
        <template #body class="flex">
            <UButton icon="i-tabler-brand-google" class="mb-4 sm:mb-6 w-max mx-auto self-center flex" @click="login">
                Login with Google
            </UButton>
            <USeparator label="OR" />
            <div class="flex flex-col gap-4">
                <UFormField label="OpenAI">
                    <UInput class="w-full" v-model="apiKeys.OpenAI"
                        placeholder="sk-feaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" icon="i-tabler-brand-openai" />
                </UFormField>
                <UFormField label="ExaAI">
                    <UInput class="w-full" v-model="apiKeys.exa" placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                        icon="i-tabler-world-search" />
                </UFormField>
                <UButton @click="apiKeysUnset = false; showLogin = false" class="w-max">
                    Save
                </UButton>
            </div>

        </template>
    </UModal>
</template>

<style>
.userAvatar span {
    color: #FFF;
}
</style>