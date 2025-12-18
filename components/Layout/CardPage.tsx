import Link from 'next/link';
import { ComponentClass, FC } from 'react';

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
    <div className="my-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {currentPage.map(item => (
        <div key={item.id as string} className="h-full">
          <Card className="h-full" linkOf={cardLinkOf} {...item} />
        </div>
      ))}
    </div>

    <div className="my-6 flex items-center justify-center gap-2">
      {pageIndex === 1 ? (
        <Button variant="outline" size="lg" disabled>
          Prev
        </Button>
      ) : (
        <Button variant="outline" size="lg" asChild>
          <Link href={pageLinkOf(pageIndex - 1)}>Prev</Link>
        </Button>
      )}

      <div className="text-muted-foreground text-sm">
        {pageIndex} / {pageCount}
      </div>

      {pageIndex === pageCount ? (
        <Button variant="outline" size="lg" disabled>
          Next
        </Button>
      ) : (
        <Button variant="outline" size="lg" asChild>
          <Link href={pageLinkOf(pageIndex + 1)}>Next</Link>
        </Button>
      )}
    </div>
  </>
);
