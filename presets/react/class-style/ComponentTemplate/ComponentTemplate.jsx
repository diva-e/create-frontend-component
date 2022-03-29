import React, { Component } from 'react';
import './<%= upperCamelCaseName %>.css';

class <%= upperCamelCaseName %> extends Component {
  render() {
    return (
      <div className="<%= name %>"></div>
    );
  }
}

export default <%= upperCamelCaseName %>;
