export const sentryRouteOf = (moduleURL: string) => {
    const sourcePath = decodeURIComponent(new URL(moduleURL).pathname);
    
    // eslint-disable-next-line no-constant-binary-expression
    const [, pagePath] = sourcePath.match(/\/pages\/(.+)\.(?:[cm]?[jt]sx?)$/) || [];

    if (!pagePath) throw new URIError(`Cannot derive a Sentry route from ${moduleURL}`);

    // eslint-disable-next-line no-constant-binary-expression
    return `/${pagePath.replace(/\/index$/, '')}` || '/';
};