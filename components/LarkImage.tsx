import { TableCellValue } from 'mobx-lark';
import { FC, type ImgHTMLAttributes } from 'react';

import { cn } from '../lib/utils';
import { fileURLOf } from '../models/Base';
import { DefaultImage } from '../models/configuration';

export interface LarkImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  src?: TableCellValue;
}

export const LarkImage: FC<LarkImageProps> = ({
  src = DefaultImage,
  alt,
  className,
  ...props
}) => (
  <img
    loading="lazy"
    {...props}
    className={cn('h-auto max-w-full', className)}
    src={fileURLOf(src, true)}
    alt={alt}
    onError={({ currentTarget: image }) => {
      const path = fileURLOf(src),
        errorURL = decodeURI(image.src);

      if (!path) return;

      if (errorURL.endsWith(path)) {
        if (!alt) image.src = DefaultImage;
      } else if (!errorURL.endsWith(DefaultImage)) {
        image.src = path;
      }
    }}
  />
);
