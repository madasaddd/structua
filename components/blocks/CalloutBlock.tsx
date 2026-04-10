import { CalloutBlockContent } from '@/lib/validators/blocks'

const colorMap = {
  blue: 'bg-callout-blue border-callout-blueBorder text-blue-900',
  yellow: 'bg-callout-yellow border-callout-yellowBorder text-yellow-900',
  green: 'bg-callout-green border-callout-greenBorder text-green-900',
  red: 'bg-callout-red border-callout-redBorder text-red-900',
  purple: 'bg-callout-purple border-callout-purpleBorder text-purple-900',
  gray: 'bg-callout-gray border-callout-grayBorder text-gray-900',
}

export default function CalloutBlock({ data }: { data: CalloutBlockContent }) {
  const { emoji, color, title, content } = data
  const themeClass = colorMap[color] || colorMap.gray

  return (
    <div className={`my-8 flex gap-5 rounded-lg p-5 shadow-sm transition-all hover:shadow-md ${themeClass}`}>
      <div className="shrink-0 text-2xl select-none leading-none pt-1" aria-hidden="true">{emoji}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold text-lg mb-1.5 tracking-tight">{title}</h4>}
        <div 
          className="text-[15px] leading-relaxed opacity-95 prose-sm prose-slate" 
          dangerouslySetInnerHTML={{ __html: content || '' }} 
        />
      </div>
    </div>
  )
}
