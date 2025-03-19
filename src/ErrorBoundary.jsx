import React from 'react';
import FallbackIllustration from './assets/illustrations/FallbackIllustration';
import './ErrorBoundary.css';

//----------------------------------------------------------------------------

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div>
            <p className="error-title">Oh no, Something went wrong!</p>

            <FallbackIllustration className="error-image" />
          </div>
          <div className="error-bottom">
            <p className="error-contact">
              So sorry, but our site is under maintenance right now.
              <br />
              We're doing our best and will be back soon.
            </p>
            <p className="error-support">Need help? Contact our support team:</p>
            <p className="error-number">
              +91-9043941910
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
