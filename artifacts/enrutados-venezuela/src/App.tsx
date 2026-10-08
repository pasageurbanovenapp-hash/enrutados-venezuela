import { Router as WouterRouter } from 'wouter';
import { Router } from '@/router';

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}

export default App;
