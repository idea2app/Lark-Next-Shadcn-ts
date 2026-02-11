import Link from 'next/link';
import { ComponentClass, FC } from 'react';

import { cn } from '../../lib/utils';
import { SearchPageMeta } from '../../models/System';
import { Button } from '../ui/button';

export interface CardPageProps extends SearchPageMeta {
  Card: ComponentClass<any> | FC<any>;
  cardLinkOf?: (id: string) => string;
  pageLinkOf: (page: number) => string;
}

export const CardPage: FC<CardPageProps> = ({
  Card,
  cardLinkOf,
  currentPage,
  pageIndex,
  pageCount,
  pageLinkOf,
}) => (
  <>
    <ol className="my-3 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 lg:grid-cols-3">
      {currentPage.map(item => (
        <li key={item.id as string} className="h-full">
          <Card className="h-full" linkOf={cardLinkOf} {...item} />
        </li>
      ))}
    </ol>

    <nav className="my-6 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="lg"
        asChild
        className={cn(pageIndex === 1 && 'pointer-events-none opacity-50')}
      >
        <Link href={pageLinkOf(pageIndex - 1)}>Prev</Link>
      </Button>

      <Button
        variant="outline"
        size="lg"
        asChild
        className={cn(
          pageIndex === pageCount && 'pointer-events-none opacity-50',
        )}
      >
        <Link href={pageLinkOf(pageIndex + 1)}>Next</Link>
      </Button>
    </nav>
  </>
);
