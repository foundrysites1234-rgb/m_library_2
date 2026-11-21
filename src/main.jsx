import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import { App } from './app/App.jsx';

createRoot(document.getElementById('root')).render(<App />);
