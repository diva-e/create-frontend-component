import { mount } from '@vue/test-utils';

import propsData from './<%= upperCamelCaseName %>.stories.content';
import <%= upperCamelCaseName %> from './<%= upperCamelCaseName %>.vue';

describe('<%= upperCamelCaseName %>', () => {
  let wrapper;

  beforeAll(() => {
    wrapper = mount(<%= upperCamelCaseName %>, {
      propsData,
      mocks: {},
    });
  });

  test('wrapper has correct css class', () => {
    expect(wrapper.classes('<%= name %>')).toBeTruthy();
  });
});
