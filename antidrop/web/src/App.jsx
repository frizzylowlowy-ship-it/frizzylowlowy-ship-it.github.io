import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { EASE, Loader } from './components/ui.jsx';
import Home from './pages/Home.jsx';

const Students = lazy(() => import('./pages/Students.jsx'));
const Teachers = lazy(() => import('./pages/Teachers.jsx'));
const Parents = lazy(() => import('./pages/Parents.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Catalog = lazy(() => import('./pages/Catalog.jsx'));
const Lesson = lazy(() => import('./pages/Lesson.jsx'));
const GamePage = lazy(() => import('./games/GamePage.jsx'));
const Material = lazy(() => import('./pages/Material.jsx'));
const Present = lazy(() => import('./pages/Present.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Join = lazy(() => import('./pages/Join.jsx'));
const Verify = lazy(() => import('./pages/Verify.jsx'));
const CertificatePage = lazy(() => import('./pages/CertificatePage.jsx'));
const Cabinet = lazy(() => import('./cabinet/Cabinet.jsx'));
const Admin = lazy(() => import('./cabinet/Admin.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Ключ анимации: внутри кабинета и админки страница не «перелистывается» целиком
const animKey = (p) => {
  const s = p.split('/')[1] || 'home';
  return ['kabinet', 'admin'].includes(s) ? s : p;
};

export default function App() {
  const loc = useLocation();
  // режим показа презентации и версии для печати — без шапки и подвала
  const bare = /\/pokaz$/.test(loc.pathname) || /[?&]print=/.test(loc.search) || /^\/gramota\//.test(loc.pathname);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [animKey(loc.pathname)]);

  return (
    <>
      {!bare && <Header />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={animKey(loc.pathname)}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: .45, ease: EASE }}>
          <Suspense fallback={<div className="container" style={{ padding: '60px 24px' }}><Loader h={360} /></div>}>
            <Routes location={loc}>
              <Route path="/" element={<Home />} />
              <Route path="/uchenikam" element={<Students />} />
              <Route path="/igry" element={<Catalog />} />
              <Route path="/igry/urok/:id" element={<Lesson />} />
              <Route path="/igry/:id" element={<GamePage />} />
              <Route path="/uchitelyam" element={<Teachers />} />
              <Route path="/uchitelyam/:id" element={<Material />} />
              <Route path="/uchitelyam/:id/pokaz" element={<Present />} />
              <Route path="/roditelyam" element={<Parents />} />
              <Route path="/o-proekte" element={<About />} />
              <Route path="/voiti" element={<Login />} />
              <Route path="/registraciya" element={<Register />} />
              <Route path="/join/:code" element={<Join />} />
              <Route path="/join" element={<Join />} />
              <Route path="/proverka" element={<Verify />} />
              <Route path="/proverka/:code" element={<Verify />} />
              <Route path="/gramota/:code" element={<CertificatePage />} />
              <Route path="/kabinet/*" element={<Cabinet />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/vhod" element={<Navigate to="/voiti" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>
      {!bare && <Footer />}
    </>
  );
}
