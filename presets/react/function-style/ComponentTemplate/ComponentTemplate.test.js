import { render, screen } from '@testing-library/react';
import <%= upperCamelCaseName %> from './<%= upperCamelCaseName %>';

test('my test case', () => {
  render(<<%= upperCamelCaseName %> />);
  const myDiv = document.querySelector("<%= name %>");
  expect(myDiv).toBeInTheDocument();
});
