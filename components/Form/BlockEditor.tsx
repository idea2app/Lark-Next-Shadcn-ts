import Code from '@editorjs/code';
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import LinkTool from '@editorjs/link';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import { Editor as Core, EditorProps } from 'idea-react';

import { cn } from '../../lib/utils';
import { upload } from '../../models/Base';

async function uploadByFile(file: File) {
  try {
    const url = await upload(file);

    return { success: 1, file: { url } };
  } catch (error) {
    console.error(error);

    return { success: 0 };
  }
}

const Tools = {
  list: List,
  code: Code,
  linkTool: LinkTool,
  image: {
    class: Image,
    config: { uploader: { uploadByFile } },
  },
  header: Header,
  quote: Quote,
};

export interface BlockEditorProps extends Omit<EditorProps, 'tools'> {
  className?: string;
}

export default function Editor({ className, ...props }: BlockEditorProps) {
  return (
    <div
      className={cn(
        'border-input bg-background min-h-64 overflow-hidden rounded-lg border p-4 shadow-sm',
        className,
      )}
    >
      <Core tools={Tools} {...props} />
    </div>
  );
}
