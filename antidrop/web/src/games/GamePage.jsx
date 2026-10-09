import { lazy, Suspense, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { byId } from '@shared/catalog.js';
import { Loader } from '../components/ui.jsx';
import NotFound from '../pages/NotFound.jsx';

const GAMES = {
  'g-flags': lazy(() => import('./FlagsGame.jsx')),
  'g-swipe': lazy(() => import('./SwipeGame.jsx')),
  'g-chat': lazy(() => import('./ChatGame.jsx')),
  'g-chain': lazy(() => import('./ChainGame.jsx')),
  'g-money': lazy(() => import('./MoneyGame.jsx')),
  'g-myth': lazy(() => import('./MythGame.jsx')),
  'g-sort': lazy(() => import('./SortGame.jsx')),
  'g-pause': lazy(() => import('./PauseGame.jsx')),
};

export default function GamePage() {
  const { id } = useParams();
  const a = byId(id);
  const G = GAMES[id];
  useEffect(() => { if (a) document.title = `${a.title} — игра · Антидроп`; }, [a]);
  if (!a || !G) return <NotFound />;
  return <Suspense fallback={<div className="container" style={{ padding: 40 }}><Loader h={400} /></div>}><G activity={a} /></Suspense>;
}
