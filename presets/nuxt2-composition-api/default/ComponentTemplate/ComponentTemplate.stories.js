import <%= upperCamelCaseName %> from './<%= upperCamelCaseName %>.vue';

export default {
  title: '<%= componentType %>/<%= upperCamelCaseName %>',
  component: <%= upperCamelCaseName %>,
}

const Template = (args, { argTypes }) => ({
  components: { <%= upperCamelCaseName %> },
  props: Object.keys(argTypes),
  template: '<<%= name %> v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {

};
