import { useEffect } from 'react';
import { CurvedArchive } from '../features/curvedArchive/CurvedArchive.jsx';
import { useLocale } from '../i18n/useLocale.js';

export function HomePage() {
  const { t } = useLocale();

  useEffect(() => {
    document.title = t.meta.homeTitle;
  }, [t.meta.homeTitle]);

  return <CurvedArchive />;
}
