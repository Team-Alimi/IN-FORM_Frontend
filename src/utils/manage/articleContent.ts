import DOMPurify from 'dompurify';

/** Source/attachment URLs must be absolute web URLs, not executable schemes. */
export const getArticleWebUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};

/** Keep article formatting without scripts, app CSS classes, forms or overlays. */
export const sanitizeArticleContent = (html: string): string => {
  const fragment = DOMPurify.sanitize(html, {
    RETURN_DOM_FRAGMENT: true,
    ALLOWED_TAGS: [
      'p',
      'div',
      'span',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'strike',
      'del',
      'sub',
      'sup',
      'br',
      'hr',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'caption',
      'colgroup',
      'col',
      'img',
      'a',
      'figure',
      'figcaption',
      'dl',
      'dt',
      'dd',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'colspan',
      'rowspan',
      'scope',
      'start',
      'reversed',
      'style',
      'data-type',
      'data-checked',
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
  fragment.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const declarations = [
      'font-size',
      'font-weight',
      'font-style',
      'font-family',
      'text-align',
      'text-decoration',
      'color',
      'background-color',
    ].map(
      (property) =>
        [property, element.style.getPropertyValue(property)] as const
    );
    element.removeAttribute('style');
    declarations.forEach(([property, value]) => {
      if (value) element.style.setProperty(property, value);
    });
  });
  fragment.querySelectorAll('a').forEach((anchor) => {
    const value = anchor.getAttribute('href') ?? '';
    let href = getArticleWebUrl(value);
    if (!href) {
      try {
        const url = new URL(value);
        if (['mailto:', 'tel:'].includes(url.protocol)) href = url.href;
      } catch {
        /* Invalid and relative addresses are shown as plain text. */
      }
    }
    if (href) {
      anchor.setAttribute('href', href);
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    } else anchor.removeAttribute('href');
  });
  fragment.querySelectorAll('img').forEach((image) => {
    const src = getArticleWebUrl(image.getAttribute('src') ?? '');
    if (!src) {
      image.remove();
      return;
    }
    image.setAttribute('src', src);
    image.setAttribute('loading', 'lazy');
    image.setAttribute('referrerpolicy', 'no-referrer');
    if (!image.hasAttribute('alt')) image.setAttribute('alt', '');
  });
  const container = document.createElement('div');
  container.append(fragment);
  return container.innerHTML;
};
