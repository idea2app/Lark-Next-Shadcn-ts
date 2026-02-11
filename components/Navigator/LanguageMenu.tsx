import { observer } from 'mobx-react';
import { FC, useContext } from 'react';

import { cn } from '../../lib/utils';
import { I18nContext, LanguageName } from '../../models/Translation';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export interface LanguageMenuProps {
  className?: string;
}

const LanguageMenu: FC<LanguageMenuProps> = observer(({ className }) => {
  const i18n = useContext(I18nContext);

  const currentLabel =
    LanguageName[i18n.currentLanguage as keyof typeof LanguageName] ||
    i18n.currentLanguage;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn('justify-between', className)}
        >
          <span className="max-w-32 truncate">{currentLabel}</span>
          <span className="ml-2 text-xs" aria-hidden>
            ▼
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={i18n.currentLanguage}
          onValueChange={value =>
            i18n.loadLanguages(value as typeof i18n.currentLanguage)
          }
        >
          {Object.entries(LanguageName).map(([key, name]) => (
            <DropdownMenuRadioItem key={key} value={key}>
              {name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default LanguageMenu;
