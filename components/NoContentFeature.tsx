'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { WeeklyUpdateModal } from '@/components/WeeklyUpdateModal'

interface NoContentFeatureProps {
  backHref: string
}

export function NoContentFeature({ backHref }: NoContentFeatureProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-white p-8 min-h-screen">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
        {/* Left Side: Illustration */}
        <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] shrink-0">
          <Image
            src="/icons/on-progress.png"
            alt="Feature Under Construction"
            fill
            className="object-contain"
          />
        </div>

        {/* Right Side: Text and Buttons */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 max-w-lg">
          <h2 className="text-[32px] font-bold text-slate-900 mb-4 leading-tight">
            Exciting Features Underway.
          </h2>
          <p className="text-[16px] text-gray-500 mb-8 leading-relaxed">
            This feature is currently under construction. Subscribe for updates and we&apos;ll alert you this Saturday.
          </p>
          
          <div className="flex flex-col gap-4 w-full sm:w-auto">
            <WeeklyUpdateModal triggerClassName="w-full sm:w-auto bg-[#111827] text-white text-[15px] font-bold py-3.5 px-6 rounded-xl hover:bg-slate-800 transition-colors text-center">
              Keep Me Updated
            </WeeklyUpdateModal>

            <Link
              href={backHref}
              className="w-full sm:w-auto flex items-center justify-start gap-2 text-slate-900 text-[15px] font-bold underline underline-offset-4 hover:opacity-70 transition-all group"
            >
              <svg 
                className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L11.7071 18.2929C12.0976 18.6834 12.0976 19.3166 11.7071 19.7071C11.3166 20.0976 10.6834 20.0976 10.2929 19.7071L3.29289 12.7071C3.10536 12.5196 3 12.2652 3 12C3 11.7348 3.10536 11.4804 3.29289 11.2929L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z" fill="currentColor"/>
              </svg>
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
