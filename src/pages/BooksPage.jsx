import { useEffect } from 'react';
import { FlatShelf } from '../features/flatShelf/FlatShelf.jsx';
import { useLocale } from '../i18n/useLocale.js';

export function BooksPage() {
  const { t } = useLocale();

  useEffect(() => {
    document.title = t.meta.booksTitle;
  }, [t.meta.booksTitle]);

  return <FlatShelf />;
}
