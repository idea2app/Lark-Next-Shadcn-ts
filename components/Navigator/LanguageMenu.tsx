import { observer } from 'mobx-react';
import { FC, useContext, useEffect, useRef, useState } from 'react';

import { cn } from '../../lib/utils';
import { I18nContext, LanguageName } from '../../models/Translation';
import { Button } from '../ui/button';

export interface LanguageMenuProps {
  className?: string;
}

const LanguageMenu: FC<LanguageMenuProps> = observer(({ className }) => {
  const i18n = useContext(I18nContext);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const node = rootRef.current;
      if (!node) return;
      if (event.target instanceof Node && !node.contains(event.target))
        setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const currentLabel =
    LanguageName[i18n.currentLanguage as keyof typeof LanguageName] ||
    i18n.currentLanguage;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full justify-between"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className="max-w-32 truncate">{currentLabel}</span>
        <span className="ml-2 text-xs" aria-hidden>
          ▼
        </span>
      </Button>

      {open && (
        <div
          role="menu"
          className="bg-popover text-popover-foreground absolute right-0 z-50 mt-2 min-w-full overflow-hidden rounded-md border shadow-md"
        >
          {Object.entries(LanguageName).map(([key, name]) => {
            const active = key === i18n.currentLanguage;

            return (
              <button
                key={key}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between px-3 py-2 text-left text-sm',
                  active && 'bg-accent',
                )}
                onClick={() => {
                  i18n.loadLanguages(key as typeof i18n.currentLanguage);
                  setOpen(false);
                }}
              >
                <span className="truncate">{name}</span>
                {active && <span className="ml-3 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default LanguageMenu;
