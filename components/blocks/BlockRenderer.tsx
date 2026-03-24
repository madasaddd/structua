import { BlockContent, TextBlockContent, CalloutBlockContent, TableBlockContent, DividerBlockContent, ImageBlockContent } from '@/lib/validators/blocks'
import TextBlock from './TextBlock'
import CalloutBlock from './CalloutBlock'
import TableBlock from './TableBlock'
import DividerBlock from './DividerBlock'
import ImageBlock from './ImageBlock'

type BlockRendererProps = {
  type: string
  contentData: any
}

export default function BlockRenderer({ type, contentData }: BlockRendererProps) {
  switch (type) {
    case 'text':
      return <TextBlock data={contentData as TextBlockContent} />
    case 'callout':
      return <CalloutBlock data={contentData as CalloutBlockContent} />
    case 'table':
      return <TableBlock data={contentData as TableBlockContent} />
    case 'divider':
      return <DividerBlock data={contentData as DividerBlockContent} />
    case 'image':
      return <ImageBlock data={contentData as ImageBlockContent} />
    default:
      return null
  }
}
