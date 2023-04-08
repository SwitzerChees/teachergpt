<template>
  <div class="flex h-screen w-full">
    <Sidebar />
    <LessonsSidebar />
    <div class="flex flex-col flex-grow items-stretch px-6 py-2">
      <slot />
      <Chatbox />
    </div>
  </div>
</template>
