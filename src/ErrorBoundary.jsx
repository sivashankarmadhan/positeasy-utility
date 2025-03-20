import React from 'react';
import FallbackIllustration from './assets/illustrations/FallbackIllustration';
import './ErrorBoundary.css';

//----------------------------------------------------------------------------

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // static getDerivedStateFromError(error) {
  //   return { hasError: true };
  // }

  static getDerivedStateFromError(error) {
    const messages = [
      {
        title: "Uh-oh! Something's Not Right",
        description:
          'Looks like we hit a small tech hiccup. No worries—our team is already working on it!',
        supportDescription: 'For immediate help, feel free to contact our support team.',
        contact: '+91-9043941910',
        thankMessage: 'Thanks for bearing with us!',
      },
      {
        title: 'Unexpected Error Detected!',
        description:
          'We encountered a minor technical issue. Our engineers are investigating the problem.',
        supportDescription: 'If you need assistance, please contact our support team.',
        contact: '+91-9043941910',
        thankMessage: 'We appreciate your patience.',
      },
      {
        title: 'Oops! We Hit a Snag',
        description: "Something didn't go as planned, but don't worry—we're on it!",
        supportDescription: 'Need help right away? Give our support team a call.',
        contact: '+91-9043941910',
        thankMessage: "We'll be back to normal soon!",
      },
      {
        title: 'Something Went Wrong!',
        description: "A small glitch occurred, and we're working to fix it.",
        supportDescription: 'For urgent support, reach out to us.',
        contact: '+91-9043941910',
        thankMessage: 'Thanks for your patience!',
      },
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    return { hasError: true, errorMessage: randomMessage };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="error-title">
            <p>{this.state.errorMessage.title}</p>
          </div>
          <div className="error-image">
            <FallbackIllustration className="error-image1" />
          </div>
          <div className="error-bottom">
            <p className="error-description">{this.state.errorMessage.description}</p>
            <p className="error-support">{this.state.errorMessage.supportDescription}</p>
            <p className="error-number">{this.state.errorMessage.contact}</p>
            <p className="error-thanks">{this.state.errorMessage.thankMessage}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
