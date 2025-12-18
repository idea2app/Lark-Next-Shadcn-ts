import { text2color } from 'idea-react';
import { GitRepository } from 'mobx-github';
import { observer } from 'mobx-react';
import { FC, type HTMLAttributes, useContext } from 'react';

import { cn } from '../../lib/utils';
import { I18nContext } from '../../models/Translation';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { GitLogo } from './Logo';

export interface GitCardProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    Pick<GitRepository, 'full_name' | 'html_url' | 'languages'>,
    Partial<Pick<GitRepository, 'topics' | 'description' | 'homepage'>> {
  className?: string;
}

export const GitCard: FC<GitCardProps> = observer(
  ({
    className = 'shadow-sm',
    full_name,
    html_url,
    languages = [],
    topics = [],
    description,
    homepage,
    ...props
  }) => {
    const { t } = useContext(I18nContext);

    return (
      <Card className={cn('flex h-full flex-col', className)} {...props}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <a
              className="underline-offset-4 hover:underline"
              target="_blank"
              href={html_url}
              rel="noreferrer"
            >
              {full_name}
            </a>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3 pt-0">
          <nav className="flex flex-wrap gap-1">
            {topics.map(topic => (
              <a
                key={topic}
                className="text-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold no-underline transition-opacity hover:opacity-90"
                style={{ backgroundColor: text2color(topic, ['light']) }}
                target="_blank"
                rel="noreferrer"
                href={`https://github.com/topics/${topic}`}
              >
                {topic}
              </a>
            ))}
          </nav>

          <ul className="grid list-none grid-cols-4 gap-4 p-0">
            {languages.map(language => (
              <li key={language}>
                <GitLogo name={language} />
              </li>
            ))}
          </ul>

          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </CardContent>

        <CardFooter className="justify-between">
          <div />
          {homepage && (
            <Button variant="secondary" asChild>
              <a target="_blank" rel="noreferrer" href={homepage}>
                {t('home_page')}
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  },
);
