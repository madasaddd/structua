'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const lowBandText = "Globalization helps developing nations grow their economies. When international companies invest there, they create jobs and increase local income. For instance, many factories moved to Vietnam, which significantly improved its economy. Therefore, globalization is beneficial for developing countries."

const highBandText = "Globalization serves as a primary catalyst for economic expansion in developing nations. The influx of foreign direct investment (FDI) stimulates growth by facilitating technology transfer and industrial modernization. A notable example is Vietnam’s rapid industrialization, where trade liberalization attracted major manufacturing firms, substantially boosting GDP. Thus, globalization remains an essential driver of long-term economic development."

export default function LandingPage() {
  const [selectedBand, setSelectedBand] = useState<'low' | 'high'>('low')
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'highlight' | 'deleted' | 'typing'>('typing')
  
  const hasPlayedHighAnimation = useRef(false)
  const hasPlayedLowAnimation = useRef(false)

  useEffect(() => {
    let active = true

    if (selectedBand === 'low') {
      if (!hasPlayedLowAnimation.current) {
        hasPlayedLowAnimation.current = true
        setIsTyping(true)
        setAnimationPhase('typing')
        setDisplayText('')
        
        const delay = setTimeout(() => {
          if (!active) return
          let currentIndex = 0
          const interval = setInterval(() => {
            if (!active) {
              clearInterval(interval)
              return
            }
            currentIndex += 2
            if (currentIndex >= lowBandText.length) {
              setDisplayText(lowBandText)
              setIsTyping(false)
              setAnimationPhase('idle')
              clearInterval(interval)
            } else {
              setDisplayText(lowBandText.substring(0, currentIndex))
            }
          }, 15)
        }, 500)
        
        return () => {
          active = false
          clearTimeout(delay)
        }
      } else {
        setIsTyping(false)
        setAnimationPhase('idle')
        setDisplayText(lowBandText)
      }
    } else if (selectedBand === 'high') {
      if (!hasPlayedHighAnimation.current) {
        hasPlayedHighAnimation.current = true
        setAnimationPhase('highlight')
        setDisplayText(lowBandText)

        const deleteTimeout = setTimeout(() => {
          if (!active) return
          setAnimationPhase('deleted')
          setDisplayText("")
          setIsTyping(true)

          const writeTimeout = setTimeout(() => {
            if (!active) return
            setAnimationPhase('typing')

            let currentIndex = 0
            const interval = setInterval(() => {
              if (!active) {
                clearInterval(interval)
                return
              }
              currentIndex += 2
              if (currentIndex >= highBandText.length) {
                setDisplayText(highBandText)
                setIsTyping(false)
                setAnimationPhase('idle')
                clearInterval(interval)
              } else {
                setDisplayText(highBandText.substring(0, currentIndex))
              }
            }, 15)
          }, 200)

          return () => clearTimeout(writeTimeout)
        }, 500)

        return () => {
          active = false
          clearTimeout(deleteTimeout)
        }
      } else {
        setIsTyping(false)
        setAnimationPhase('idle')
        setDisplayText(highBandText)
      }
    }

    return () => {
      active = false
    }
  }, [selectedBand])

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans flex flex-col">
      {/* Header / Logo */}
      <header className="w-full flex justify-center pt-10 pb-6">
        <Image 
          src="/icons/Structua logo.svg" 
          alt="Structua Logo" 
          width={140} 
          height={40} 
          className="object-contain"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-12 pb-48 flex flex-col gap-8">
        {/* Top Text Section */}
        <div className="flex flex-col gap-4 mt-8">
          <h1 className="text-[56px] leading-[1.15] tracking-[-1.5px] font-bold text-left max-w-3xl">
            The Structured Route<br />
            to flawless IELTS Writing.
          </h1>
        </div>

        {/* Practice Writing Interactive Card */}
        <div className="group block w-full outline-none mt-4">
          <div className="flex w-full flex-col gap-6 rounded-[20px] bg-[#252132] p-8 overflow-hidden transition-all duration-300">
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-3 max-w-[70%]">
                <h3 className="font-bold text-[#FFFFFF] text-[40px] leading-[1.2] tracking-[-0.01em]">Practice writing</h3>
                <p className="font-normal text-[#D2D6E1] text-[20px] leading-[1.44] tracking-[-0.01em]">
                  Practice paragraph by paragraph, instantly fixing gaps in your grammar, vocabulary, and coherence.
                </p>
              </div>
              <Link href="/writing/paragraph?onboarding=true" className="flex items-center gap-4 py-[8px] px-0 rounded-[40px] bg-transparent group-hover:bg-[#332E42] group-hover:pl-[20px] group-hover:pr-[8px] transition-all duration-300 shrink-0">
                <span className="text-[#FFFFFF] font-medium text-[16px] whitespace-nowrap">Practice Now</span>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shrink-0">
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" fill="#000000"/>
                  </svg>
                </div>
              </Link>
            </div>

            <div className="bg-white rounded-[16px] p-6 flex flex-col gap-4 text-left justify-start">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBand('low')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedBand === 'low'
                      ? 'bg-[#EFF3FC] border-[#B8D7FF] text-[#221B2F]'
                      : 'bg-transparent border-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Band 5.0–6.0 answer
                </button>
                <button
                  onClick={() => setSelectedBand('high')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedBand === 'high'
                      ? 'bg-[#EFF3FC] border-[#B8D7FF] text-[#221B2F]'
                      : 'bg-transparent border-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Band 7.0–8.0 answer
                </button>
              </div>
              
              <div className="grid grid-cols-1 grid-rows-1 w-full">
                {/* Invisible height anchor to lock height based on the longest text */}
                <div className="col-start-1 row-start-1 opacity-0 pointer-events-none text-gray-800 text-[15px] leading-relaxed font-sans select-none">
                  {highBandText}
                </div>

                {/* Visible animated typing paragraph */}
                <div className="col-start-1 row-start-1 flex flex-col justify-start">
                  <p className="text-gray-800 text-[15px] leading-relaxed font-sans">
                    {animationPhase === 'highlight' ? (
                      <span className="bg-[#B8D7FF] text-[#221B2F] rounded-sm select-all">
                        {displayText}
                      </span>
                    ) : (
                      <>
                        {displayText}
                        {isTyping && <span className="inline-block w-1.5 h-4 bg-blue-600 ml-1 animate-pulse" />}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Grid Section for Vocabulary and Grammar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Vocabulary */}
          <Link href="/vocab" className="group block w-full outline-none">
            <div className="flex w-full flex-col justify-between rounded-[20px] bg-[#B8D7FF] h-[320px] p-8 overflow-hidden transition-all duration-300">
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-3 max-w-[65%]">
                  <h3 className="font-bold text-[#111827] text-[40px] leading-[1.2] tracking-[-0.01em]">Vocabulary</h3>
                  <p className="font-normal text-[#303E51] text-[20px] leading-[1.44] tracking-[-0.01em]">Discover Band 9 words and practice using them in context.</p>
                </div>
                <div className="relative shrink-0 pt-2 pr-2">
                  <div className="w-[100px] h-[100px] relative transition-all duration-300 group-hover:scale-110 -rotate-[6deg] group-hover:rotate-0 transform origin-center">
                    <Image 
                      src="/icons/image-card1.png" 
                      alt="Vocabulary" 
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex w-full items-center mt-auto">
                <div className="flex items-center gap-4 py-[8px] px-0 rounded-[40px] bg-transparent group-hover:bg-white/50 group-hover:pl-[20px] group-hover:pr-[8px] transition-all duration-300 w-max">
                  <span className="text-[#111827] font-medium text-[16px]">Expand My Vocabulary</span>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shrink-0">
                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" fill="#000000"/>
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </Link>

          {/* Card 2: Grammar */}
          <Link href="/day/1" className="group block w-full outline-none">
            <div className="flex w-full flex-col justify-between rounded-[20px] bg-[#C2FFED] h-[320px] p-8 overflow-hidden transition-all duration-300">
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-3 max-w-[65%]">
                  <h3 className="font-bold text-[#111827] text-[40px] leading-[1.2] tracking-[-0.01em]">Grammar</h3>
                  <p className="font-normal text-[#303E51] text-[20px] leading-[1.44] tracking-[-0.01em]">Refine your grammar and write structured paragraphs with the TEEL approach.</p>
                </div>
                <div className="relative shrink-0 pt-2 pr-2">
                  <div className="w-[100px] h-[100px] relative transition-all duration-300 group-hover:scale-110 rotate-[6deg] group-hover:rotate-0 transform origin-center">
                    <Image 
                      src="/icons/image-card2.png" 
                      alt="Grammar" 
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex w-full items-center mt-auto">
                <div className="flex items-center gap-4 py-[8px] px-0 rounded-[40px] bg-transparent group-hover:bg-white/50 group-hover:pl-[20px] group-hover:pr-[8px] transition-all duration-300 w-max">
                  <span className="text-[#111827] font-medium text-[16px]">Upgrade My Grammar</span>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shrink-0">
                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" fill="#000000"/>
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-6 text-center px-6">
          <Image 
            src="/icons/Structua logo.svg" 
            alt="Structua Logo" 
            width={100} 
            height={28} 
            className="object-contain opacity-80 mix-blend-multiply grayscale"
          />
          <div className="flex gap-6 text-[14px] font-medium text-[#4b5563]">
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLSefrqXuGFKGYwGW1dAPIB-UUiFpHN0gB9s_0qLnfz9AbxN3EQ/viewform" target="_blank" rel="noopener noreferrer" className="hover:text-[#111827] transition-colors">Feedback</Link>
            <Link href="https://www.linkedin.com/in/asad-albalad/" target="_blank" rel="noopener noreferrer" className="hover:text-[#111827] transition-colors">Contact Creator</Link>
          </div>
          <p className="text-[12px] leading-relaxed text-[#6b7280] max-w-2xl mx-auto">
            IELTS is a registered trademark of Cambridge ESOL, the British Council, and IDP Education. Structua is unaffiliated with these entities. All trademarks on this site, excluding Structua, belong to their respective owners.
          </p>
        </div>
      </footer>
    </div>
  )
}
