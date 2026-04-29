import { FC, type HTMLAttributes } from 'react';

import { PageHead } from './PageHead';

export interface MDXLayoutProps extends HTMLAttributes<HTMLElement> {
  title?: string;
}

export const MDXLayout: FC<MDXLayoutProps> = ({
  className = 'mx-auto w-full max-w-3xl px-4 py-10',
  title,
  children,
  ...props
}) => (
  <article {...props} className={className}>
    <PageHead title={title} />
    <h1 className="my-6 text-3xl font-bold tracking-tight">{title}</h1>

    {children}
  </article>
);
