import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AboutPage } from '../pages/AboutPage.jsx';
import { ArticlePage } from '../pages/ArticlePage.jsx';
import { BooksPage } from '../pages/BooksPage.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { JournalPage } from '../pages/JournalPage.jsx';
import { LegalPage } from '../pages/LegalPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { PageTransition } from './PageTransition.jsx';
import { ShellLayout } from './ShellLayout.jsx';

const ContactPage = lazy(() =>
  import('../pages/ContactPage.jsx').then((m) => ({ default: m.ContactPage }))
);

export function AppRoutes() {
  return (
    <PageTransition>
      {(displayLocation) => (
        <ShellLayout pathname={displayLocation.pathname}>
          <Routes location={displayLocation}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BooksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:slug" element={<ArticlePage />} />
            <Route
              path="/contact"
              element={
                <Suspense fallback={null}>
                  <ContactPage />
                </Suspense>
              }
            />
            <Route path="/legal/:slug" element={<LegalPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ShellLayout>
      )}
    </PageTransition>
  );
}
