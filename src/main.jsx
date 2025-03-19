import ReactDOM from 'react-dom/client';
//
import { RecoilRoot } from 'recoil';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import ConfigService from './services/ConfigService';
import EventsService from './services/EventsService';
import { BrowserRouter } from 'react-router-dom';

// css
import './index.css';
import ErrorBoundary from './ErrorBoundary';

// ----------------------------------------------------------------------
if (window.mainAPI) {
  console.log = (args, data) => {
    window.mainAPI.log('log', { args, data });
  };
}
const root = ReactDOM.createRoot(document.getElementById('root'));

EventsService.boot(() => {
  ConfigService.boot(() => {
    root.render(
      <RecoilRoot>
        <BrowserRouter>
        <ErrorBoundary>
          <App />
          </ErrorBoundary>
        </BrowserRouter>
      </RecoilRoot>
    );
  });
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
