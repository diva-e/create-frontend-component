<template>
  <div class="<%= name %> minimal">
    Minimal Text
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {

  },
  setup () {
    return {}
  }
})
</script>

<style lang="scss" scoped>
@import '~~/assets/scss/components';

</style>
