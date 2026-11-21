import { BrowserRouter } from 'react-router-dom';
import { LocaleProvider } from '../i18n/useLocale.js';
import { AppRoutes } from './routes.jsx';

export function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <AppRoutes />
      </LocaleProvider>
    </BrowserRouter>
  );
}
