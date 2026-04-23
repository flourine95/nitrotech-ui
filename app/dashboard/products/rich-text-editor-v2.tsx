'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useDebouncedCallback } from 'use-debounce';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Minus, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Heading1, Heading2, Heading3, Highlighter,
  Code, Table as TableIcon, ImageIcon,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import MediaPickerDialog from '@/components/media-picker-dialog';
import type { Editor } from '@tiptap/react';

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

// ── Toolbar helpers ───────────────────────────────────────────────────────────

function ToolbarButton({ onClick, disabled, title, children }: {
  onClick: () => void; disabled?: boolean; title?: string; children: React.ReactNode;
}) {
  return (
    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClick} disabled={disabled} title={title}>
      {children}
    </Button>
  );
}

function ToolbarToggle({ pressed, onPressedChange, title, children }: {
  pressed: boolean; onPressedChange: () => void; title?: string; children: React.ReactNode;
}) {
  return (
    <Toggle size="sm" pressed={pressed} onPressedChange={onPressedChange} title={title} className="h-7 w-7 p-0">
      {children}
    </Toggle>
  );
}

// ── Toolbar — isolated, uses useEditorState to avoid unnecessary re-renders ───

function Toolbar({ editor, onInsertImage }: { editor: Editor; onInsertImage: () => void }) {
  const s = useEditorState({
    editor,
    selector: (ctx) => ({
      canUndo: ctx.editor.can().undo(),
      canRedo: ctx.editor.can().redo(),
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isUnderline: ctx.editor.isActive('underline'),
      isStrike: ctx.editor.isActive('strike'),
      isHighlight: ctx.editor.isActive('highlight'),
      isCode: ctx.editor.isActive('codeBlock'),
      isH1: ctx.editor.isActive('heading', { level: 1 }),
      isH2: ctx.editor.isActive('heading', { level: 2 }),
      isH3: ctx.editor.isActive('heading', { level: 3 }),
      isBullet: ctx.editor.isActive('bulletList'),
      isOrdered: ctx.editor.isActive('orderedList'),
      isBlockquote: ctx.editor.isActive('blockquote'),
      isLink: ctx.editor.isActive('link'),
      isSubscript: ctx.editor.isActive('subscript'),
      isSuperscript: ctx.editor.isActive('superscript'),
      alignLeft: ctx.editor.isActive({ textAlign: 'left' }),
      alignCenter: ctx.editor.isActive({ textAlign: 'center' }),
      alignRight: ctx.editor.isActive({ textAlign: 'right' }),
    }),
  });

  const setLink = useCallback(() => {
    const url = window.prompt('URL:', editor.getAttributes('link').href);
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-2 py-1">
      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!s.canUndo} title="Undo">
        <Undo className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!s.canRedo} title="Redo">
        <Redo className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {/* Headings */}
      <ToolbarToggle pressed={s.isH1} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isH2} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isH3} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {/* Inline marks */}
      <ToolbarToggle pressed={s.isBold} onPressedChange={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
        <Bold className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isItalic} onPressedChange={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
        <Italic className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isUnderline} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isStrike} onPressedChange={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isHighlight} onPressedChange={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
        <Highlighter className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isSubscript} onPressedChange={() => editor.chain().focus().toggleSubscript().run()} title="Subscript (H₂O)">
        <SubscriptIcon className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isSuperscript} onPressedChange={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript (m²)">
        <SuperscriptIcon className="h-3.5 w-3.5" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {/* Alignment */}
      <ToolbarToggle pressed={s.alignLeft} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} title="Align left">
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.alignCenter} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} title="Align center">
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.alignRight} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} title="Align right">
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {/* Lists & blocks */}
      <ToolbarToggle pressed={s.isBullet} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        <List className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isOrdered} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isBlockquote} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
        <Quote className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={s.isCode} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
        <Code className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <Minus className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {/* Insert */}
      <ToolbarToggle pressed={s.isLink} onPressedChange={setLink} title="Link">
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarButton onClick={onInsertImage} title="Chèn ảnh">
        <ImageIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={insertTable} title="Chèn bảng">
        <TableIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function RichTextEditorV2({ content, onChange, onBlur, disabled = false }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [showImagePicker, setShowImagePicker] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      codeBlock: false,
      // Disable to avoid duplicate warnings with separately added extensions
      link: false,
      underline: false,
    }),
    Placeholder.configure({ placeholder: 'Nhập mô tả sản phẩm...' }),
    Underline,
    Link.configure({ openOnClick: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    Highlight,
    Image.configure({ inline: false, allowBase64: false }),
    Subscript,
    Superscript,
    CodeBlock,
    Table.configure({ resizable: false }),
    TableRow,
    TableCell,
    TableHeader,
  ], []);

  const debouncedOnChange = useDebouncedCallback((html: string) => {
    onChangeRef.current(html);
  }, 500);

  const handleUpdate = useCallback(
    ({ editor: e }: { editor: Editor }) => {
      const html = e.getHTML();
      debouncedOnChange(html === '<p></p>' ? '' : html);
    },
    [debouncedOnChange],
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions,
    content,
    editable: !disabled,
    onUpdate: handleUpdate,
    onBlur: () => {
      debouncedOnChange.flush();
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-36 px-3 py-2',
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor ?? null;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = content || '';
    if (current !== normalized) {
      editor.commands.setContent(normalized, false);
    }
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  return (
    <>
      <div className={cn(
        'overflow-hidden rounded-md border bg-background text-sm transition-colors focus-within:ring-1 focus-within:ring-ring',
        disabled && 'pointer-events-none opacity-60',
      )}>
        <Toolbar editor={editor} onInsertImage={() => setShowImagePicker(true)} />
        <EditorContent editor={editor} />
      </div>

      {showImagePicker && (
        <MediaPickerDialog
          folder="products"
          multiple
          onInsert={(urls) => {
            urls.forEach((url) => {
              editorRef.current?.chain().focus().setImage({ src: url }).run();
            });
          }}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </>
  );
}
