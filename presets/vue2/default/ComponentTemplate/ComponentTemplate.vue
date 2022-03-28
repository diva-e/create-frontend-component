<template>
  <div class="<%= name %>">
    Text: {{ text }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    text: {
      type: String,
      default: 'DEFAULT: please overwrite me by setting property text'
    }
  }
})
</script>

<style lang="scss" scoped>
.<%= name %> {

}
</style>
