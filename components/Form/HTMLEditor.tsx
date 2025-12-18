import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { type PropsWithChildren, useCallback, useEffect } from 'react';

import { cn } from '../../lib/utils';
import { upload } from '../../models/Base';

export interface HTMLEditorProps {
  className?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  name?: string;
}

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  title,
}: PropsWithChildren<ToolbarButtonProps>) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      className={cn(
        'rounded px-2 py-1 text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-foreground',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function HTMLEditor({
  className,
  value,
  defaultValue,
  placeholder,
  onChange,
}: HTMLEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
      }),
    ],
    content: value || defaultValue || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-48 px-3 py-2 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file && editor) {
        try {
          const url = await upload(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();

      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const copyAsMarkdown = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    navigator.clipboard.writeText(html);
    alert('HTML copied to clipboard');
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'border-input bg-background overflow-hidden rounded-lg border shadow-sm',
        className,
      )}
    >
      <div className="border-border bg-muted/50 flex flex-wrap gap-1 border-b p-2">
        <ToolbarButton
          active={editor.isActive('bold')}
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('strike')}
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('code')}
          title="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {'</>'}
        </ToolbarButton>

        <span className="bg-border mx-1 w-px" />

        <ToolbarButton
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>

        <span className="bg-border mx-1 w-px" />

        <ToolbarButton
          active={editor.isActive('bulletList')}
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          title="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('blockquote')}
          title="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          "
        </ToolbarButton>

        <span className="bg-border mx-1 w-px" />

        <ToolbarButton
          active={editor.isActive('link')}
          title="Link"
          onClick={setLink}
        >
          🔗
        </ToolbarButton>
        <ToolbarButton title="Image" onClick={addImage}>
          🖼️
        </ToolbarButton>

        <span className="bg-border mx-1 w-px" />

        <ToolbarButton title="Copy HTML" onClick={copyAsMarkdown}>
          📋
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
