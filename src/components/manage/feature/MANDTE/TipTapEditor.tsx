import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import { EditorState } from '@tiptap/pm/state';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  RiH2,
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiSeparator,
  RiDoubleQuotesL,
  RiListUnordered,
  RiListOrdered,
  RiListCheck2,
  RiIndentDecrease,
  RiIndentIncrease,
  RiTableLine,
  RiImageLine,
  RiLink,
  RiCodeLine,
  RiCodeBoxLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
} from 'react-icons/ri';
import EditorDialog from './EditorDialog';

export interface TipTapEditorHandle {
  getHTML: () => string;
  isEmpty: () => boolean;
  insertImages: (
    images: { file_url: string; original_name?: string }[]
  ) => void;
  removeImage: (url: string) => void;
}
const TipTapEditor = forwardRef<
  TipTapEditorHandle,
  {
    initialValue: string;
    disabled: boolean;
    onChange: () => void;
    onUpload: (files: File[]) => void;
  }
>(({ initialValue, disabled, onChange, onUpload }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const disabledRef = useRef(disabled);
  const uploadRef = useRef(onUpload);
  const changeRef = useRef(onChange);
  useEffect(() => {
    disabledRef.current = disabled;
    uploadRef.current = onUpload;
    changeRef.current = onChange;
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, defaultProtocol: 'https' },
      }),
      Image.configure({ allowBase64: false }),
      TextStyle,
      FontSize,
      TableKit,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialValue,
    onUpdate: () => changeRef.current(),
    editorProps: {
      attributes: {
        class: 'tiptap-content min-h-[360px] p-5 outline-none',
        role: 'textbox',
        'aria-label': '게시글 본문',
        'aria-multiline': 'true',
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (!files.length) return false;
        event.preventDefault();
        if (!disabledRef.current) uploadRef.current(files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (!files.length) return false;
        event.preventDefault();
        if (!disabledRef.current) uploadRef.current(files);
        return true;
      },
    },
  });
  useEditorState({ editor, selector: ({ editor: current }) => current?.state });
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);
  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() ?? '',
    isEmpty: () =>
      !editor ||
      (!editor.getText().trim() && !editor.getHTML().includes('<img')),
    insertImages: (images) => {
      editor
        ?.chain()
        .focus()
        .insertContent(
          images.map((image) => ({
            type: 'image',
            attrs: { src: image.file_url, alt: image.original_name ?? '' },
          }))
        )
        .run();
    },
    removeImage: (url) => {
      if (!editor) return;
      const tr = editor.state.tr;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === url)
          tr.delete(tr.mapping.map(pos), tr.mapping.map(pos + node.nodeSize));
      });
      editor.view.dispatch(tr);
      // A removed upload must not be restored by undo with a deleted URL.
      editor.view.updateState(
        EditorState.create({
          schema: editor.schema,
          doc: editor.state.doc,
          plugins: editor.state.plugins,
        })
      );
    },
  }));
  if (!editor) return null;
  const buttons = [
    {
      label: '제목 서식',
      Icon: RiH2,
      active: editor.isActive('heading'),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: '굵게',
      Icon: RiBold,
      active: editor.isActive('bold'),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: '기울임',
      Icon: RiItalic,
      active: editor.isActive('italic'),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: '취소선',
      Icon: RiStrikethrough,
      active: editor.isActive('strike'),
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: '구분선',
      Icon: RiSeparator,
      run: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      label: '인용',
      Icon: RiDoubleQuotesL,
      active: editor.isActive('blockquote'),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: '글머리 목록',
      Icon: RiListUnordered,
      active: editor.isActive('bulletList'),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: '번호 목록',
      Icon: RiListOrdered,
      active: editor.isActive('orderedList'),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: '체크리스트',
      Icon: RiListCheck2,
      active: editor.isActive('taskList'),
      run: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      label: '내어쓰기',
      Icon: RiIndentDecrease,
      run: () =>
        editor
          .chain()
          .focus()
          .liftListItem(editor.isActive('taskItem') ? 'taskItem' : 'listItem')
          .run(),
    },
    {
      label: '들여쓰기',
      Icon: RiIndentIncrease,
      run: () =>
        editor
          .chain()
          .focus()
          .sinkListItem(editor.isActive('taskItem') ? 'taskItem' : 'listItem')
          .run(),
    },
    {
      label: '표 추가',
      Icon: RiTableLine,
      run: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      label: '이미지 추가',
      Icon: RiImageLine,
      run: () => inputRef.current?.click(),
    },
    {
      label: '링크',
      Icon: RiLink,
      active: editor.isActive('link'),
      run: () => {
        setLinkUrl(String(editor.getAttributes('link').href ?? ''));
        setLinkError('');
        setLinkOpen(true);
      },
    },
    {
      label: '인라인 코드',
      Icon: RiCodeLine,
      active: editor.isActive('code'),
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      label: '코드 블록',
      Icon: RiCodeBoxLine,
      active: editor.isActive('codeBlock'),
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: '실행 취소',
      Icon: RiArrowGoBackLine,
      run: () => editor.chain().focus().undo().run(),
    },
    {
      label: '다시 실행',
      Icon: RiArrowGoForwardLine,
      run: () => editor.chain().focus().redo().run(),
    },
  ];
  return (
    <section
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
      aria-label="본문 편집기"
    >
      <div
        role="toolbar"
        aria-label="본문 서식"
        className="flex flex-wrap items-center gap-1 border-b border-gray-100 px-3 py-2 text-gray-600"
      >
        {buttons.map(({ label, Icon, active, run }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active ?? false}
            disabled={disabled}
            onClick={run}
            className={`rounded p-2 hover:bg-gray-100 disabled:opacity-40 ${active ? 'bg-gray-200 text-black' : ''}`}
          >
            <Icon size={16} />
          </button>
        ))}
        {editor.isActive('table') && (
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              행 추가
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              열 추가
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              표 삭제
            </button>
          </>
        )}
        <input
          ref={inputRef}
          aria-label="본문 이미지 파일"
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp"
          multiple
          hidden
          disabled={disabled}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            if (files.length) onUpload(files);
          }}
        />
      </div>
      <div className="max-h-[600px] overflow-auto">
        <EditorContent editor={editor} />
      </div>
      {linkOpen && (
        <EditorDialog title="링크 설정" onCancel={() => setLinkOpen(false)}>
          <label className="block">
            링크 주소
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://"
              className="mt-2 w-full rounded-lg border border-gray-200 p-3"
            />
          </label>
          {linkError && (
            <p role="alert" className="mt-2 text-red-600">
              {linkError}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange('link')
                  .unsetLink()
                  .run();
                setLinkOpen(false);
              }}
            >
              링크 제거
            </button>
            <button type="button" onClick={() => setLinkOpen(false)}>
              취소
            </button>
            <button
              type="button"
              className="rounded-lg bg-black px-4 py-2 text-white"
              onClick={() => {
                try {
                  if (!['http:', 'https:'].includes(new URL(linkUrl).protocol))
                    throw new Error();
                } catch {
                  setLinkError('http 또는 https 주소를 입력해 주세요.');
                  return;
                }
                editor
                  .chain()
                  .focus()
                  .extendMarkRange('link')
                  .setLink({ href: linkUrl })
                  .run();
                setLinkOpen(false);
              }}
            >
              적용
            </button>
          </div>
        </EditorDialog>
      )}
    </section>
  );
});
TipTapEditor.displayName = 'TipTapEditor';
export default TipTapEditor;
