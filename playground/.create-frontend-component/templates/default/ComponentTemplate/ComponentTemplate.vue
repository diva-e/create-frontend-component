<template>
  <div class="<%= name %>">
    <p>{{ text }}</p>
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
@import '~~/assets/scss/components';

.<%= name %> {
  background-color: #fdd;
}

</style>
