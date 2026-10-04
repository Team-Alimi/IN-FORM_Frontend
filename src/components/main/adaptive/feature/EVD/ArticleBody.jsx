import { useMemo } from 'react';
import DOMPurify from 'dompurify';

const getWebUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

const ArticleBody = ({ content = '', attachments = [] }) => {
  const prepared = useMemo(() => {
    const text = content ?? '';
    const html = /<\/?[a-z][^>]*>/i.test(text);
    const imageUrls = new Set();
    let body = text;
    if (html) {
      const fragment = DOMPurify.sanitize(text, {
        RETURN_DOM_FRAGMENT: true,
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
        FORBID_ATTR: ['style', 'class', 'id', 'srcset', 'width', 'height'],
      });
      fragment.querySelectorAll('img').forEach((image) => {
        const url = getWebUrl(image.getAttribute('src'));
        if (!url) { image.remove(); return; }
        image.src = url;
        imageUrls.add(url);
      });
      fragment.querySelectorAll('a').forEach((link) => {
        const url = getWebUrl(link.getAttribute('href'));
        if (url) link.href = url;
        else link.removeAttribute('href');
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      });
      const container = document.createElement('div');
      container.append(fragment);
      body = container.innerHTML;
    }
    const files = [];
    for (const file of attachments ?? []) {
      const url = getWebUrl(file.file_url);
      if (!url || imageUrls.has(url)) continue;
      imageUrls.add(url);
      files.push({ ...file, file_url: url, image: file.content_type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|svg|bmp)(?:[?#]|$)/i.test(url) });
    }
    return { html, body, files };
  }, [content, attachments]);

  return (
    <div data-article-body className="min-w-0 text-gray-800 leading-relaxed wrap-break-word">
      {prepared.html ? (
        <div className="[&_p]:mb-3 [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:block [&_table]:overflow-x-auto [&_pre]:whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: prepared.body }} />
      ) : <div className="whitespace-pre-wrap">{prepared.body}</div>}
      {prepared.files.map((file) => file.image ? (
        <img key={file.file_url} src={file.file_url} alt={file.original_name || '첨부 이미지'} className="my-4 h-auto max-w-full rounded-lg" />
      ) : (
        <a key={file.file_url} href={file.file_url} target="_blank" rel="noopener noreferrer" className="mt-3 block break-all text-blue-600 underline">{file.original_name || '첨부파일'}</a>
      ))}
    </div>
  );
};

export default ArticleBody;
