<template>
  <div class="flex h-screen w-full">
    <Sidebar />
    <div class="flex flex-col flex-grow items-start overflow-hidden px-6 py-4"><slot /></div>
  </div>
</template>
