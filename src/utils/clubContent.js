import DOMPurify from "dompurify";

const isHtml = (value) => /<\/?[a-z][^>]*>/i.test(value);
const imageExtension = /\.(?:png|jpe?g|gif|webp|avif|svg|bmp)(?:[?#]|$)/i;

export const prepareClubContent = (content = '', attachments = []) => {
  const images = [];
  const seen = new Set();
  const addImage = (url, name) => {
    if (!url) return;
    let parsed;
    try { parsed = new URL(url, window.location.origin); } catch { return; }
    if (!['http:', 'https:'].includes(parsed.protocol) || seen.has(parsed.href)) return;
    seen.add(parsed.href);
    images.push({ file_url: parsed.href, original_name: name });
  };
  for (const file of attachments ?? []) {
    if (file.content_type?.startsWith('image/') || imageExtension.test(file.file_url ?? '')) {
      addImage(file.file_url, file.original_name);
    }
  }
  if (!isHtml(content ?? '')) return { images, content: content ?? '', html: false };
  const fragment = DOMPurify.sanitize(content, { RETURN_DOM_FRAGMENT: true });
  fragment.querySelectorAll('img').forEach((image) => {
    addImage(image.getAttribute('src'), image.getAttribute('alt'));
    image.remove();
  });
  fragment.querySelectorAll('picture, source').forEach((element) => element.remove());
  fragment.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  const container = document.createElement('div');
  container.append(fragment);
  return { images, content: container.innerHTML, html: true };
};
