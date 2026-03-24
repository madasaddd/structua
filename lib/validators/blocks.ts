import { z } from 'zod'

const TextBlockSchema = z.object({
  variant: z.enum(['h1', 'h2', 'h3', 'body-lg', 'body-md', 'body-sm']),
  content: z.string(),
})

const CalloutBlockSchema = z.object({
  emoji: z.string(),
  color: z.enum(['blue', 'yellow', 'green', 'red', 'purple', 'gray']),
  title: z.string().optional(),
  content: z.string(),
})

const TableBlockSchema = z.object({
  caption: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
})

const DividerBlockSchema = z.object({}).strict()

const ImageBlockSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
})

export const BlockContentSchema = {
  text: TextBlockSchema,
  callout: CalloutBlockSchema,
  table: TableBlockSchema,
  divider: DividerBlockSchema,
  image: ImageBlockSchema,
}

export type TextBlockContent = z.infer<typeof TextBlockSchema>
export type CalloutBlockContent = z.infer<typeof CalloutBlockSchema>
export type TableBlockContent = z.infer<typeof TableBlockSchema>
export type DividerBlockContent = z.infer<typeof DividerBlockSchema>
export type ImageBlockContent = z.infer<typeof ImageBlockSchema>

export type BlockContent =
  | TextBlockContent
  | CalloutBlockContent
  | TableBlockContent
  | DividerBlockContent
  | ImageBlockContent
