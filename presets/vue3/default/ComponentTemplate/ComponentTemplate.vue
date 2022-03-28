<template>
  <div class="<%= name %>">
    Text: {{ text }}
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
  text?: string
}>()
</script>

<style lang="scss" scoped>
.<%= name %> {

}
</style>

