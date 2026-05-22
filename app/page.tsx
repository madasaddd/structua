import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-12 pb-48 flex flex-col gap-12">
        {/* Top Text Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 mt-8">
          <h1 className="flex-1 text-[56px] leading-[1.2] tracking-[-1px] font-bold text-left">
            Crack the IELTS<br />
            Rubric with AI.
          </h1>
          <p className="flex-1 text-[16px] leading-[1.44] tracking-[-1px] font-medium text-right text-[#4b5563] max-w-md">
            The perfect AI companion to complement your formal IELTS course and supercharge your prep. Master advanced vocabulary and review tricky grammar with instant, smart quiz feedback.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          {/* Card 1: Vocabulary */}
          <Link href="/vocab" className="group block w-full outline-none">
            <div className="flex w-full flex-col justify-between rounded-[20px] bg-[#252132] h-[320px] p-8 overflow-hidden transition-all duration-300">
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-3 max-w-[65%]">
                  <h3 className="font-bold text-[#FFFFFF] text-[40px] leading-[1.2] tracking-[-0.01em]">Vocabulary</h3>
                  <p className="font-normal text-[#D2D6E1] text-[20px] leading-[1.44] tracking-[-0.01em]">Discover, practice, and review band 9 vocabulary in context.</p>
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
                <div className="flex items-center gap-4 py-[8px] px-0 rounded-[40px] bg-transparent group-hover:bg-[#332E42] group-hover:pl-[20px] group-hover:pr-[8px] transition-all duration-300 w-max">
                  <span className="text-[#FFFFFF] font-medium text-[16px]">Expand My Vocabulary</span>
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
