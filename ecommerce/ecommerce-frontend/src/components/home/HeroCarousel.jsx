import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
const slides = [
  {
    id: 1,
    title: 'Summer Collection 2026',
    subtitle: 'Up to 50% off on trending styles. Free shipping on orders over ₹999.',
    cta: 'Shop Now',
    ctaLink: '#categories',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80',
    gradient: 'from-indigo-900/80 via-indigo-800/60 to-transparent',
  },
  {
    id: 2,
    title: 'New Arrivals Daily',
    subtitle: 'Discover the latest products across electronics, fashion, and home.',
    cta: 'Explore Deals',
    ctaLink: '#categories',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
    gradient: 'from-purple-900/80 via-purple-800/60 to-transparent',
  },
  {
    id: 3,
    title: 'Quality You Can Trust',
    subtitle: 'Curated brands, secure payments, and fast delivery nationwide.',
    cta: 'Browse Categories',
    ctaLink: '#categories',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
    gradient: 'from-slate-900/80 via-slate-800/60 to-transparent',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goTo = (index) => setCurrent(index)
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent((c) => (c + 1) % slides.length)

  return (
    <section className="relative overflow-hidden bg-gray-900">
      <div className="relative h-[200px] sm:h-[280px] lg:h-[340px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === current ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div className="max-w-lg">
                  <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                    {slide.title}
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-white/90 sm:mt-3 sm:text-base">
                    {slide.subtitle}
                  </p>
                  {slide.ctaLink.startsWith('#') ? (
                    <a href={slide.ctaLink} className="mt-5 inline-block sm:mt-6">
                      <Button className="shadow-lg">{slide.cta}</Button>
                    </a>
                  ) : (
                    <Link to={slide.ctaLink} className="mt-5 inline-block sm:mt-6">
                      <Button className="shadow-lg">{slide.cta}</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30 sm:left-5"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30 sm:right-5"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all ${
              index === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
