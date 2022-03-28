<template>
  <div class="<%= name %>">
    Text: {{ text }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    text: {
      type: String,
      default: undefined
    }
  },
  setup () {
    return {}
  }
})
</script>

<style lang="scss" scoped>
.<%= name %> {

}
</style>
