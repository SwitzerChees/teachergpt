<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
  const { isMobile } = useDevice()
  const route = useRoute()

  const layout = computed(() => {
    if (route.path.startsWith('/login')) {
      return 'login'
    }

    return isMobile ? 'mobile' : 'default'
  })
</script>
