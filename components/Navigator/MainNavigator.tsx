import { observer } from 'mobx-react';
import Link from 'next/link';
import { FC, useContext, useState } from 'react';

import { Name } from '../../models/configuration';
import { I18nContext } from '../../models/Translation';
import { Button } from '../ui/button';
import LanguageMenu from './LanguageMenu';

export const MainNavigator: FC = observer(() => {
  const { t } = useContext(I18nContext);
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground fixed inset-x-0 top-0 z-50 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {Name}
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/article"
            className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
          >
            {t('article')}
          </Link>
          <Link
            href="/wiki"
            className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
          >
            {t('wiki')}
          </Link>
          <Link
            href="/component"
            className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
          >
            {t('component')}
          </Link>
          <Link
            href="/pagination"
            className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
          >
            {t('pagination')}
          </Link>
          <Link
            href="/scroll-list"
            className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
          >
            {t('scroll_list')}
          </Link>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/idea2app/Lark-Next-Shadcn-ts"
            className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
          >
            {t('source_code')}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageMenu className="max-w-40" />

          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="sm:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen(v => !v)}
          >
            <span className="text-base">☰</span>
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-primary-foreground/20 border-t sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <Link
              href="/article"
              className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {t('article')}
            </Link>
            <Link
              href="/wiki"
              className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {t('wiki')}
            </Link>
            <Link
              href="/component"
              className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {t('component')}
            </Link>
            <Link
              href="/pagination"
              className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {t('pagination')}
            </Link>
            <Link
              href="/scroll-list"
              className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {t('scroll_list')}
            </Link>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://github.com/idea2app/Lark-Next-Shadcn-ts"
              className="hover:bg-primary-foreground/10 rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {t('source_code')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
});
