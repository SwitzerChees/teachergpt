<template>
  <div class="bg-slate-800 rounded p-4 flex flex-col py-12 gap-4 border-2 border-slate-700 max-w-md">
    <div class="rounded-full overflow-hidden flex justify-center items-center w-28 h-28 self-center">
      <img width="120" src="~/assets/images/logo.png" />
    </div>
    <span class="text-center text-green-300"
      >TeacherGPT ist eine Lernplattform um Studenten zu ermöglichen, konrkete Fragen über einen Kurs und die rain verwendeten
      Kursmaterialien zu stellen.</span
    >
    <h1 class="self-center">Einloggen</h1>
    <span class="text-blue-200 text-center">Logge dich mit deinem Microsoft Konto ein.</span>
    <Button class="self-center" @click="microsoftLogin">
      <div class="flex gap-2 font-bold">
        <Icon name="material-symbols:login" size="1.5rem" class="flex-shrink-0" />
        <span>Einloggen</span>
      </div>
    </Button>
  </div>
</template>

<script setup lang="ts">
  const { authenticateProvider, getProviderAuthenticationUrl } = useStrapiAuth()

  definePageMeta({
    layout: 'login',
  })

  const route = useRoute()
  onMounted(async () => {
    // Check for auth token from microsoft
    if (route.query.access_token) {
      await authenticateProvider('microsoft', route.query.access_token as string)
      location.reload()
    }
  })

  // Internal Login
  const microsoftLogin = () => {
    window.location = getProviderAuthenticationUrl('microsoft') as any
  }
</script>
