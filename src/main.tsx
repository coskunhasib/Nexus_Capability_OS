import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import Shell from './Shell.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell />
  </StrictMode>,
);
