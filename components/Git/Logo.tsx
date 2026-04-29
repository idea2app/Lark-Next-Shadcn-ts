import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Component, type ImgHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

export interface GitLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  name: string;
}

@observer
export class GitLogo extends Component<GitLogoProps> {
  @observable
  accessor path = '';

  async componentDidMount() {
    const { name } = this.props;
    const topic = name.toLowerCase();

    try {
      const { src } = await this.loadImage(
        `https://raw.githubusercontent.com/github/explore/master/topics/${topic}/${topic}.png`,
      );
      this.path = src;
    } catch {
      const { src } = await this.loadImage(`https://github.com/${name}.png`);

      this.path = src;
    }
  }

  loadImage(path: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new globalThis.Image();

      image.onload = () => resolve(image);
      image.onerror = reject;

      image.src = path;
    });
  }

  render() {
    const { path } = this;
    const { name, className, ...props } = this.props;

    return (
      path && (
        <img
          {...props}
          className={cn('h-10 w-10 object-contain', className)}
          src={path}
          alt={name}
          loading="lazy"
        />
      )
    );
  }
}
