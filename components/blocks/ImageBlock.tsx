import Image from 'next/image'
import { ImageBlockContent } from '@/lib/validators/blocks'

export default function ImageBlock({ data }: { data: ImageBlockContent }) {
  return (
    <figure className="my-8 flex flex-col items-center">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-gray-50 aspect-video">
        <Image src={data.url} alt={data.caption || 'Image block'} fill className="object-contain" />
      </div>
      {data.caption && <figcaption className="mt-2 text-sm text-gray-500 text-center">{data.caption}</figcaption>}
    </figure>
  )
}
