<template>
  <div
    class="flex min-h-screen flex-col px-5 py-10 font-sans bg-bg-default md:items-center md:justify-center md:gap-30"
  >
    <div
      class="flex w-full flex-1 flex-col gap-14 md:w-97.5 md:flex-none md:gap-16 lg:w-100 lg:gap-18"
    >
      <AppLogo class="self-start h-8 md:h-10" />
      <slot />
    </div>
    <div class="flex w-full items-center justify-between md:w-97.5 lg:w-100">
      <slot name="footer" />
    </div>
  </div>
</template>
