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

type LanguageKey = keyof typeof LanguageName;

const languageOptions = Object.entries(LanguageName) as [LanguageKey, string][];

const LanguageMenu: FC<LanguageMenuProps> = observer(({ className }) => {
  const i18n = useContext(I18nContext);
  const currentLanguage = i18n.currentLanguage as LanguageKey;

  const currentLabel = LanguageName[currentLanguage] ?? i18n.currentLanguage;

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
          value={currentLanguage}
          onValueChange={value => i18n.loadLanguages(value as LanguageKey)}
        >
          {languageOptions.map(([key, name]) => (
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
