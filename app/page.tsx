import TopNavBar from '@/components/landing/TopNavBar'
import HeroSection from '@/components/landing/HeroSection'
import ObjectivesSection from '@/components/landing/ObjectivesSection'
import CtaSection from '@/components/landing/CtaSection'
import SiteFooter from '@/components/landing/SiteFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#303e51]">
      <TopNavBar />
      <main>
        <HeroSection />
        <ObjectivesSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
