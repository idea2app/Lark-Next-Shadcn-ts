declare module '*.less' {
  const map: Record<string, string>;

  export default map;
}

declare module '@editorjs/*' {
  const Plugin: import('@editorjs/editorjs').ToolConstructable;

  export default Plugin;
}

declare namespace JSX {
  interface IntrinsicElements {
    'pwa-install': import('react').DetailedHTMLProps<
      import('react').HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      icon?: string;
      name?: string;
      description?: string;
      'install-description'?: string;
    };
  }
}
