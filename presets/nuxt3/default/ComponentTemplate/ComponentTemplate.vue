<template>
  <div class="<%= name %>">
    Text
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
  text?: string
}>()
</script>

<style lang="scss" scoped>
@import '~~/assets/scss/components';

</style>

