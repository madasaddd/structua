import { TextBlockContent } from '@/lib/validators/blocks'

export default function TextBlock({ data }: { data: TextBlockContent }) {
  const { variant, content } = data
  const safeContent = content || ''

  switch (variant) {
    case 'h1':
      return <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mt-16 mb-8 leading-tight" dangerouslySetInnerHTML={{ __html: safeContent }} />
    case 'h2':
      return <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800 mt-12 mb-6 border-b border-gray-100 pb-2" dangerouslySetInnerHTML={{ __html: safeContent }} />
    case 'h3':
      return <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-10 mb-4" dangerouslySetInnerHTML={{ __html: safeContent }} />
    case 'body-lg':
      return <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-8 font-light" dangerouslySetInnerHTML={{ __html: safeContent }} />
    case 'body-md':
      return <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: safeContent }} />
    case 'body-sm':
      return <p className="text-sm leading-relaxed text-gray-500 mb-6 italic" dangerouslySetInnerHTML={{ __html: safeContent }} />
    default:
      return <p className="text-base leading-relaxed text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: safeContent }} />
  }
}
