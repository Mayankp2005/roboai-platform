// Mute strict mode warning
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

window.addEventListener('error', (event) => {
  console.error("GLOBAL ERROR CAPTURED:", event.error?.stack || event.error);
  const stack = event.error?.stack || event.message || event.filename + ":" + event.lineno;
  fetch('http://localhost:3001/log-error', { method: 'POST', body: "WINDOW ERROR:\n" + stack }).catch(()=>{});
  
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.zIndex = '999999';
  div.style.background = 'red';
  div.style.color = 'white';
  div.style.padding = '20px';
  div.style.whiteSpace = 'pre-wrap';
  div.innerText = "AGENT STACK TRACE:\n" + stack;
  document.body.appendChild(div);
  event.preventDefault(); // hide from console
});

window.addEventListener('unhandledrejection', (event) => {
  const stack = event.reason?.stack || event.reason;
  fetch('http://localhost:3001/log-error', { method: 'POST', body: "PROMISE ERROR:\n" + stack }).catch(()=>{});

  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.zIndex = '999999';
  div.style.background = 'blue';
  div.style.color = 'white';
  div.style.padding = '20px';
  div.style.whiteSpace = 'pre-wrap';
  div.innerText = "AGENT PROMISE TRACE:\n" + stack;
  document.body.appendChild(div);
});

createRoot(document.getElementById('root')!).render(
  <App />
)
