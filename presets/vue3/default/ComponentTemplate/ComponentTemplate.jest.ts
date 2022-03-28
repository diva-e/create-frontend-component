import { mount } from '@vue/test-utils'
import <%= upperCamelCaseName %> from '~/components/atoms/<%= upperCamelCaseName %>/<%= upperCamelCaseName %>.vue'

describe('<%= upperCamelCaseName %>', () => {
  it('is a Vue instance', () => {
    const wrapper = mount(<%= upperCamelCaseName %>)
    expect(wrapper.vm).toBeTruthy()
  })
})
