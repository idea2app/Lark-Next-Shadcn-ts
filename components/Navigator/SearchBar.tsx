import { observer } from 'mobx-react';
import {
  type ChangeEventHandler,
  FC,
  type FormHTMLAttributes,
  useContext,
} from 'react';

import { cn } from '../../lib/utils';
import { I18nContext } from '../../models/Translation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export interface SearchBarProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onChange'
> {
  size?: 'sm' | 'lg';
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  expanded?: boolean;
}

export const SearchBar: FC<SearchBarProps> = observer(
  ({
    action = '/search',
    size,
    name = 'keywords',
    placeholder,
    expanded = true,
    defaultValue,
    value,
    onChange,
    ...props
  }) => {
    const { t } = useContext(I18nContext);

    placeholder ??= t('keywords');

    const inputSizeClass =
      size === 'sm' ? 'h-9' : size === 'lg' ? 'h-11' : undefined;
    const buttonSizeClass =
      size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-11 w-11' : undefined;

    return (
      <form
        {...props}
        action={action}
        className={cn('flex w-full items-center gap-2', props.className)}
      >
        <Input
          type="search"
          className={cn(
            'min-w-0',
            inputSizeClass,
            expanded
              ? 'flex-1'
              : 'w-12 transition-[width] duration-200 focus:w-40',
          )}
          {...{ name, placeholder, defaultValue, value, onChange }}
        />
        <Button
          type="submit"
          variant="outline"
          size="icon"
          className={buttonSizeClass}
          aria-label="Search"
        >
          <span aria-hidden>🔍</span>
        </Button>
      </form>
    );
  },
);
