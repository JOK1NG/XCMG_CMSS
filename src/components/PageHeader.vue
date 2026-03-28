<template>
  <div class="page-header">
    <div>
      <h2 class="page-title">{{ title }}</h2>
      <p v-if="description" class="page-desc">{{ description }}</p>
    </div>

    <div v-if="$slots.right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>