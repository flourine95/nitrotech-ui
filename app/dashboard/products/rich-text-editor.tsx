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

localeActions.setLang('vi');

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RichTextEditor({ content, onChange, disabled = false }: RichTextEditorProps) {
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
      depth: 50,
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

  const debouncedOnChange = useDebouncedCallback(onChange, 300);

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
        className="bg-background shadow-sm transition-colors overflow-hidden"
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'oklch(0.922 0 0)',
          borderRadius: '8px',
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey || e.metaKey) e.stopPropagation();
        }}
      >
        <div className="flex max-h-full w-full flex-col">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5" style={{ backgroundColor: 'oklch(0.97 0 0)', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'oklch(0.922 0 0)' }}>
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
