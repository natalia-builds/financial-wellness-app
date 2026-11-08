import { text } from '../text/en';

/**
 * Builds the full <title> for a page: the page name first, then the site name.
 * If the page name is the site name (the home page), it isn't repeated.
 * Extra spaces around the page name are ignored.
 */
export function pageTitle(
  title: string,
  siteName: string = text.site.name,
  separator: string = text.site.titleSeparator,
): string {
  const name = title.trim();
  if (name === '' || name === siteName) return siteName;
  return `${name}${separator}${siteName}`;
}
