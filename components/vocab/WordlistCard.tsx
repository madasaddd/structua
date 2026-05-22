import Link from 'next/link'
import { Prisma } from '@prisma/client'

type WordlistWithDetails = Prisma.WordlistGetPayload<{
  include: { vocabularies: true }
}>

export function WordlistCard({
  wordlist,
  category,
}: {
  wordlist: WordlistWithDetails
  category: { id: string; name: string; labelColor?: string | null }
}) {
  return (
    <div className="group relative flex flex-col justify-end w-full min-w-[210px] h-[220px] rounded-xl border border-[#E2E3ED] bg-transparent overflow-hidden">
      
      {/* Top Container (Inline SVG and Label) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[108px] flex items-center justify-center pt-2.5">
        {/* Inline animated SVG */}
        <div className="absolute inset-x-0 bottom-0 top-2.5 w-full flex items-center justify-center">
          <svg
            width="200"
            height="96"
            viewBox="0 0 200 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[200px] h-[96px] shrink-0"
          >
            <defs>
              <filter
                id={`filter0_d_card_${wordlist.id}`}
                x="24.4229"
                y="0.42334"
                width="143.862"
                height="94.7188"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="2" />
                <feGaussianBlur stdDeviation="4" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow"
                  result="shape"
                />
              </filter>
              <filter
                id={`filter1_d_card_${wordlist.id}`}
                x="32.3506"
                y="2.61377"
                width="141.903"
                height="90.7666"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="2" />
                <feGaussianBlur stdDeviation="4" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow"
                  result="shape"
                />
              </filter>
              <filter
                id={`filter2_d_card_${wordlist.id}`}
                x="30"
                y="0"
                width="141"
                height="89"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="2" />
                <feGaussianBlur stdDeviation="4" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow"
                  result="shape"
                />
              </filter>
            </defs>

            {/* Background Left Card */}
            <g
              filter={`url(#filter0_d_card_${wordlist.id})`}
              className="transition-transform duration-500 ease-out -translate-x-[20px] md:translate-x-0 md:group-hover:-translate-x-[20px]"
            >
              <rect
                x="32"
                y="12.7993"
                width="124.927"
                height="72.8742"
                rx="8"
                transform="rotate(-3.11989 32 12.7993)"
                fill="white"
              />
              <rect
                x="32.2632"
                y="13.0353"
                width="124.427"
                height="72.3742"
                rx="7.75"
                transform="rotate(-3.11989 32.2632 13.0353)"
                stroke="#E2E3ED"
                strokeWidth="0.5"
              />
            </g>

            {/* Background Right Card */}
            <g
              filter={`url(#filter1_d_card_${wordlist.id})`}
              className="transition-transform duration-500 ease-out translate-x-[20px] md:translate-x-0 md:group-hover:translate-x-[20px]"
            >
              <rect
                x="41.4844"
                y="8.47559"
                width="124.927"
                height="72.8742"
                rx="8"
                transform="rotate(1 41.4844 8.47559)"
                fill="white"
              />
              <rect
                x="41.73"
                y="8.72991"
                width="124.427"
                height="72.3742"
                rx="7.75"
                transform="rotate(1 41.73 8.72991)"
                stroke="#E2E3ED"
                strokeWidth="0.5"
              />
            </g>

            {/* Center Front Card */}
            <g
              filter={`url(#filter2_d_card_${wordlist.id})`}
              className="transition-transform duration-500 ease-out -translate-y-[4px] md:translate-y-0 md:group-hover:-translate-y-[4px]"
            >
              <rect
                x="38"
                y="6"
                width="125"
                height="73"
                rx="8"
                fill="white"
              />
              <rect
                x="38.25"
                y="6.25"
                width="124.5"
                height="72.5"
                rx="7.75"
                stroke="#E2E3ED"
                strokeWidth="0.5"
              />
            </g>
          </svg>
        </div>
        
        {/* Label */}
        <div 
          className="relative z-10 flex items-center justify-center px-4 py-1 rounded-[12px] text-[10px] font-medium font-sans text-gray-800"
          style={{ backgroundColor: category.labelColor || '#D3E0FB' }}
        >
          ---
        </div>
      </div>

      {/* Bottom Container (Gradient and Content) */}
      <div 
        className="relative z-20 flex w-full flex-col items-center gap-2 px-4 pb-3 md:pb-1 md:group-hover:pb-3 pt-6 transition-[padding] duration-300 ease-out"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 10%, rgba(255,255,255,1) 100%)' }}
      >
        <h3 className="text-center font-medium text-[#222631] text-[16px] leading-[1.32] tracking-[-0.005em]">
          {wordlist.title}
        </h3>
        <p className="text-center font-medium text-[#657084] text-[12px] leading-[1.44] tracking-[-0.005em]">
          {wordlist.vocabularies.length} {wordlist.vocabularies.length === 1 ? 'vocabulary' : 'vocabularies'}
        </p>

        {/* Buttons (Animated reveal) */}
        <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out w-full">
          <div className="overflow-hidden flex gap-2 w-full justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 ease-out pt-1">
            <Link
              href={`/vocab/${wordlist.id}/discovery`}
              className="flex items-center justify-center flex-1 rounded-[20px] bg-[#222631] px-3 py-2 text-[14px] font-medium text-[#ffffff] hover:bg-black transition-colors min-w-0"
            >
              <span className="truncate">Discover It</span>
            </Link>
            <Link
              href={`/vocab/${wordlist.id}`}
              className="flex items-center justify-center flex-1 rounded-[20px] bg-[#F0F3FB] px-3 py-2 text-[14px] font-medium text-[#222631] hover:bg-[#E2E6F2] transition-colors min-w-0"
            >
              <span className="truncate">See Vocab</span>
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  )
}
