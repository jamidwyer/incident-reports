import { Component } from 'react';
import { ErrorFallback } from './App.jsx';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} info={this.state.info} />;
    }

    return this.props.children;
  }
}
