'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { EditorContent, useEditor } from '@tiptap/react';
import { RichTextProvider } from 'reactjs-tiptap-editor';
import { localeActions } from 'reactjs-tiptap-editor/locale-bundle';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from '@tiptap/extensions';
import { HardBreak } from '@tiptap/extension-hard-break';
import { TextStyle } from '@tiptap/extension-text-style';
import { ListItem } from '@tiptap/extension-list';
import { History, RichTextUndo, RichTextRedo } from 'reactjs-tiptap-editor/history';
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { TextUnderline, RichTextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Strike, RichTextStrike } from 'reactjs-tiptap-editor/strike';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { TextAlign, RichTextAlign } from 'reactjs-tiptap-editor/textalign';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import {
  RichTextBubbleText,
  RichTextBubbleLink,
  RichTextBubbleImage,
  RichTextBubbleTable,
  RichTextBubbleMenuDragHandle,
} from 'reactjs-tiptap-editor/bubble';
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';

import 'reactjs-tiptap-editor/style.css';
import 'react-image-crop/dist/ReactCrop.css';

// Set Vietnamese locale once
localeActions.setLang('vi');

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RichTextEditor({ content, onChange, disabled = false }: RichTextEditorProps) {
  // Memoize extensions để không tạo lại mỗi render
  const extensions = useMemo(() => [
    Document,
    Text,
    Dropcursor,
    Gapcursor,
    HardBreak,
    Paragraph,
    TrailingNode,
    ListItem,
    TextStyle,
    Placeholder.configure({ placeholder: "Nhập mô tả sản phẩm... (gõ '/' để xem lệnh)" }),
    History.configure({
      depth: 50, // Giảm history depth để nhẹ hơn
    }),
    Bold,
    Italic,
    TextUnderline,
    Strike,
    Heading,
    BulletList,
    OrderedList,
    Link,
    Blockquote,
    HorizontalRule,
    TextAlign,
    Color,
    Image.configure({ resourceImage: 'both' }),
    SlashCommand,
  ], []);

  // Debounce onChange 300ms
  const debouncedOnChange = useDebouncedCallback(onChange, 300);

  // Handle update
  const handleUpdate = useCallback(
    ({ editor }: any) => {
      const html = editor.getHTML();
      const normalized = html === '<p></p>' ? '' : html;
      debouncedOnChange(normalized);
    },
    [debouncedOnChange],
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    textDirection: 'auto',
    extensions,
    content,
    editable: !disabled,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
      },
    },
  });

  // sync external content changes (e.g. reset form)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = content || '';
    if (current !== normalized && (normalized === '' || normalized !== current)) {
      editor.commands.setContent(normalized, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <div
        className="rounded-md bg-background"
        style={{
          border: '1px solid hsl(var(--input))',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey || e.metaKey) e.stopPropagation();
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid hsl(var(--ring))';
          e.currentTarget.style.boxShadow = '0 0 0 1px hsl(var(--ring))';
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid hsl(var(--input))';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div className="flex max-h-full w-full flex-col">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 px-2 py-1.5">
            <RichTextUndo />
            <RichTextRedo />
            <div className="mx-1 h-4 w-px bg-border" />
            <RichTextHeading />
            <div className="mx-1 h-4 w-px bg-border" />
            <RichTextBold />
            <RichTextItalic />
            <RichTextUnderline />
            <RichTextStrike />
            <div className="mx-1 h-4 w-px bg-border" />
            <RichTextColor />
            <div className="mx-1 h-4 w-px bg-border" />
            <RichTextAlign />
            <div className="mx-1 h-4 w-px bg-border" />
            <RichTextBulletList />
            <RichTextOrderedList />
            <div className="mx-1 h-4 w-px bg-border" />
            <RichTextLink />
            <RichTextImage />
            <div className="mx-1 h-4 w-px bg-border" />
            <RichTextBlockquote />
            <RichTextHorizontalRule />
          </div>

          {/* Editor area */}
          <EditorContent
            editor={editor}
            className="px-3 py-2 text-sm [&_.tiptap]:min-h-36 [&_.tiptap]:outline-none"
          />

          {/* Bubble menus */}
          <RichTextBubbleText />
          <RichTextBubbleLink />
          <RichTextBubbleImage />
          <RichTextBubbleTable />
          <RichTextBubbleMenuDragHandle />
          <SlashCommandList />
        </div>
      </div>

    </RichTextProvider>
  );
}
