// HomePage.jsx — assembles all sections
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import TrustBar from '../components/layout/TrustBar'
import HeroSection from '../components/sections/HeroSection'
import BrandsSection from '../components/sections/BrandsSection'
import BestSellersSection from '../components/sections/BestSellersSection'
import QuoteSection from '../components/sections/QuoteSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <BrandsSection />
        <BestSellersSection />
        <QuoteSection />
      </main>
      <Footer />
    </>
  )
}
