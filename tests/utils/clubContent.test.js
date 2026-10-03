import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareClubContent } from '../../src/utils/clubContent.js';

test('gallery recognizes image MIME types or extensions independently', (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'https://example.com' } },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else delete globalThis.window;
  });
  const attachments = [
    { file_url: '/poster.png', content_type: 'application/octet-stream' },
    { file_url: '/download/42', content_type: 'image/jpeg' },
    { file_url: '/photo.JPG?version=1#preview' },
    { file_url: '/guide.pdf', content_type: 'application/pdf' },
    { file_url: '/unknown', content_type: 'application/octet-stream' },
    { file_url: '/poster.png', content_type: 'image/png' },
    { file_url: 'javascript:alert(1)', content_type: 'image/png' },
  ];
  const result = prepareClubContent('Plain text', attachments);
  assert.deepEqual(result.images.map((image) => image.file_url), [
    'https://example.com/poster.png',
    'https://example.com/download/42',
    'https://example.com/photo.JPG?version=1#preview',
  ]);
  assert.equal(result.content, 'Plain text');
  assert.equal(result.html, false);
});
