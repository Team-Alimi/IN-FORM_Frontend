import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { forwardRef, useImperativeHandle, useRef } from 'react';

// TextStyle 기반 FontSize 커스텀 Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontSize ?? null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: { chain: () => ReturnType<Editor['chain']> }) =>
          chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => ReturnType<Editor['chain']> }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export interface TipTapEditorHandle {
  getHTML: () => string;
}

interface TipTapEditorProps {
  initialValue?: string;
  height?: string;
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(
  ({ initialValue = '', height = '400px' }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
      extensions: [
        StarterKit,
        Image.configure({ allowBase64: true, inline: false }),
        TextStyle,
        FontSize,
      ],
      content: initialValue,
      editorProps: {
        attributes: {
          class: 'tiptap-content outline-none p-3 min-h-full',
        },
        handleDrop(view, event) {
          const file = event.dataTransfer?.files?.[0];
          if (!file?.type.startsWith('image/')) return false;
          event.preventDefault();
          readAsBase64(file, (src) => {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes['image']!.create({ src })
              )
            );
          });
          return true;
        },
        handlePaste(view, event) {
          const file = event.clipboardData?.files?.[0];
          if (!file?.type.startsWith('image/')) return false;
          event.preventDefault();
          readAsBase64(file, (src) => {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes['image']!.create({ src })
              )
            );
          });
          return true;
        },
      },
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? '',
    }));

    const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      readAsBase64(file, (src) => {
        editor.chain().focus().setImage({ src }).run();
      });
      e.target.value = '';
    };

    if (!editor) return null;

    return (
      <div className="border border-gray-300 rounded-md overflow-hidden">
        {/* 툴바 */}
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
          <ToolbarButton
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="B"
            className="font-bold"
          />
          <ToolbarButton
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="I"
            className="italic"
          />
          <ToolbarButton
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            label="S"
            className="line-through"
          />

          <Divider />

          <select
            className="text-sm border border-gray-300 rounded px-1 py-0.5 bg-white"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                editor.chain().focus().setFontSize(e.target.value).run();
              } else {
                editor.chain().focus().unsetFontSize().run();
              }
            }}
          >
            <option value="">크기</option>
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size.replace('px', '')}
              </option>
            ))}
          </select>

          <Divider />

          <ToolbarButton
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            label="• 목록"
          />
          <ToolbarButton
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            label="1. 목록"
          />

          <Divider />

          <ToolbarButton
            active={false}
            onClick={() => fileInputRef.current?.click()}
            label="이미지"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageInsert}
          />
        </div>

        {/* 에디터 본문 */}
        <div style={{ height }} className="overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    );
  }
);

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;

function readAsBase64(file: File, callback: (src: string) => void) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result as string);
  reader.readAsDataURL(file);
}

function ToolbarButton({
  active,
  onClick,
  label,
  className = '',
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-sm ${className} ${
        active
          ? 'bg-gray-700 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-300 mx-0.5" />;
}
