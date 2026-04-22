'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { useDebouncedCallback } from 'use-debounce';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Minus, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Heading1, Heading2, Heading3, Highlighter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/react';

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

// ── Toolbar — isolated component using useEditorState ─────────────────────────
// Separated so toolbar re-renders independently from EditorContent

function ToolbarButton({
  onClick, disabled, title, children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

function ToolbarToggle({
  pressed, onPressedChange, title, children,
}: {
  pressed: boolean;
  onPressedChange: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Toggle
      size="sm"
      pressed={pressed}
      onPressedChange={onPressedChange}
      title={title}
      className="h-7 w-7 p-0"
    >
      {children}
    </Toggle>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  // useEditorState — only re-renders when these specific values change
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      canUndo: ctx.editor.can().undo(),
      canRedo: ctx.editor.can().redo(),
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isUnderline: ctx.editor.isActive('underline'),
      isStrike: ctx.editor.isActive('strike'),
      isH1: ctx.editor.isActive('heading', { level: 1 }),
      isH2: ctx.editor.isActive('heading', { level: 2 }),
      isH3: ctx.editor.isActive('heading', { level: 3 }),
      isBullet: ctx.editor.isActive('bulletList'),
      isOrdered: ctx.editor.isActive('orderedList'),
      isBlockquote: ctx.editor.isActive('blockquote'),
      isLink: ctx.editor.isActive('link'),
      isHighlight: ctx.editor.isActive('highlight'),
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

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-2 py-1">
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!state.canUndo} title="Undo">
        <Undo className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!state.canRedo} title="Redo">
        <Redo className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <ToolbarToggle pressed={state.isH1} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.isH2} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.isH3} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <ToolbarToggle pressed={state.isBold} onPressedChange={() => editor.chain().focus().toggleBold().run()} title="Bold">
        <Bold className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.isItalic} onPressedChange={() => editor.chain().focus().toggleItalic().run()} title="Italic">
        <Italic className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.isUnderline} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.isStrike} onPressedChange={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.isHighlight} onPressedChange={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
        <Highlighter className="h-3.5 w-3.5" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <ToolbarToggle pressed={state.alignLeft} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} title="Align left">
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.alignCenter} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} title="Align center">
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.alignRight} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} title="Align right">
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarToggle>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <ToolbarToggle pressed={state.isBullet} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        <List className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.isOrdered} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarToggle pressed={state.isBlockquote} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
        <Quote className="h-3.5 w-3.5" />
      </ToolbarToggle>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <Minus className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <ToolbarToggle pressed={state.isLink} onPressedChange={setLink} title="Link">
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarToggle>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function RichTextEditorV2({ content, onChange, onBlur, disabled = false }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const extensions = useMemo(() => [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Placeholder.configure({ placeholder: 'Nhập mô tả sản phẩm...' }),
    Underline,
    Link.configure({ openOnClick: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    Highlight,
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
    shouldRerenderOnTransaction: false, // prevent re-render on every transaction
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
    <div className={cn(
      'overflow-hidden rounded-md border bg-background text-sm transition-colors focus-within:ring-1 focus-within:ring-ring',
      disabled && 'opacity-60 pointer-events-none',
    )}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
