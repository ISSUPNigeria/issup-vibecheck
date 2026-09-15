import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa'
import Header from '../components/shared/Header'
import AuthModal from '../components/auth/AuthModal'
import { NIGERIAN_HOSPITALS } from '../constants/hospitals'

function Home() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showAllHospitals, setShowAllHospitals] = useState(false)
  const [hospitalFilter, setHospitalFilter] = useState('All')
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Auto-open login modal when navigated here with ?login=true (e.g. from Header login button)
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setShowAuthModal(true)
    }
  }, [searchParams])

  const handleStartScreening = () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      navigate('/screening')
    } else {
      setShowAuthModal(true)
    }
  }

  const filteredHospitals = hospitalFilter === 'All'
    ? NIGERIAN_HOSPITALS
    : NIGERIAN_HOSPITALS.filter(h => h.type === hospitalFilter)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235B2D91' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Your Journey to{' '}
                <span className="text-purple">Recovery</span>{' '}
                Starts Here
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Take a confidential screening for substance use and mental health concerns, and connect with supportive resources. You're not alone, help is available.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={handleStartScreening}
                  className="bg-purple hover:bg-purple/90 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
                >
                  Start Free Screening
                </button>
                <button
                  onClick={() => window.scrollTo({ top: document.getElementById('features').offsetTop, behavior: 'smooth' })}
                  className="border-2 border-gray-300 hover:border-purple text-gray-700 hover:text-purple px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
                >
                  Learn More
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No Registration</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>5-10 Minutes</span>
                </div>
              </div>

            </div>

            {/* Right Image */}
            <div className="relative animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://behavioralhealthnews.org/wp-content/uploads/2022/07/AdobeStock_441937488web.jpg"
                  alt="African woman smiling - mental wellness"
                  className="w-full h-[280px] sm:h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-4 sm:-bottom-8 left-2 sm:-left-8 bg-white rounded-xl shadow-xl p-3 sm:p-6 animate-bounce-in max-w-[160px] sm:max-w-none">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">24/7</p>
                    <p className="text-xs sm:text-sm text-gray-600">Support Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-10 sm:py-14 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-sm sm:text-base text-gray-500 font-medium uppercase tracking-wider mb-2">
              A Collaborative Initiative By
            </p>
            <div className="w-16 h-1 bg-purple mx-auto rounded-full"></div>
          </div>

          {/* Partner Logos Grid - Equal Visibility */}
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 md:gap-20 lg:gap-24">
            <img
              src="/publica_logo.png"
              alt="Publica AI"
              className="h-14 md:h-24 w-auto object-contain"
            />
            <img
              src="/issup_logo_full.png"
              alt="ISSUP Nigeria"
              className="h-14 sm:h-16 md:h-20 w-auto object-contain"
            />
            <img
              src="/fnph_yaba_logo.png"
              alt="Federal Neuropsychiatric Hospital Yaba"
              className="h-14 md:h-28 w-auto object-contain"
            />
            <img
              src="/nigcomsat_logo.png"
              alt="NIGCOMSAT"
              className="h-14 md:h-24 w-auto object-contain"
            />
          </div>
          {/* 
          <p className="text-center text-gray-400 text-xs sm:text-sm mt-8">
            Building tools for mental health support in Nigeria
          </p> */}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Comprehensive Support for Your Well-being
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines evidence-based screening with compassionate AI support to guide you toward the right resources
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Feature 1 - Teal */}
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(to right, #75DFE1, #124A66)' }}></div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'rgba(117, 223, 225, 0.2)' }}>
                <svg className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: '#124A66' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Private & Confidential</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Your responses are completely secure and anonymous. No personal information is stored. Your privacy and trust matter to us.
              </p>
            </div>

            {/* Feature 2 - Purple */}
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple to-purple/60"></div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple/10 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">AI-Powered Support</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Get empathetic guidance and personalized feedback from our AI chatbot, designed to understand and support your unique journey.
              </p>
            </div>

            {/* Feature 3 - Orange */}
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange to-orange/60"></div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange/10 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Professional Resources</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Connect with qualified addiction professionals and support services near you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Government Mental Health Hospitals */}
      <section id="hospitals" className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">🏥</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Government Mental Health Hospitals
              </h2>
            </div>
            <div className="w-16 h-1 bg-purple mx-auto rounded-full mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              A complete list of government-approved mental health facilities across Nigeria.
              These hospitals provide professional psychiatric and mental health services.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {['All', 'Federal', 'Teaching', 'State', 'Rehabilitation'].map((filter) => (
              <button
                key={filter}
                onClick={() => { setHospitalFilter(filter); setShowAllHospitals(false); }}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${hospitalFilter === filter
                  ? filter === 'Federal' ? 'bg-red text-white shadow-md' :
                    filter === 'State' ? 'bg-purple text-white shadow-md' :
                    filter === 'Teaching' ? 'text-white shadow-md' :
                    filter === 'Rehabilitation' ? 'bg-green text-white shadow-md' :
                    'bg-purple text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                style={hospitalFilter === filter && filter === 'Teaching' ? { backgroundColor: '#124A66' } : {}}
              >
                {filter}
                <span className="ml-1.5 text-xs opacity-80">
                  ({filter === 'All' ? NIGERIAN_HOSPITALS.length : NIGERIAN_HOSPITALS.filter(h => h.type === filter).length})
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showAllHospitals ? filteredHospitals : filteredHospitals.slice(0, 9)).map((hospital, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md border border-gray-100 hover:border-purple/30 transition-all duration-300"
              >
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 leading-snug">
                  {hospital.name}
                </h3>
                {hospital.address && (
                  <p className="text-xs text-gray-400 mb-2 leading-snug">{hospital.address}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{hospital.state} State</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      hospital.type === 'Federal' ? 'bg-red/10 text-red' :
                      hospital.type === 'Teaching' ? '' :
                      hospital.type === 'Rehabilitation' ? 'bg-green/10 text-green' :
                      'bg-purple/10 text-purple'
                    }`}
                    style={hospital.type === 'Teaching' ? { backgroundColor: 'rgba(18, 74, 102, 0.1)', color: '#124A66' } : {}}
                  >
                    {hospital.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredHospitals.length > 9 && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllHospitals(!showAllHospitals)}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple text-purple rounded-lg font-semibold hover:bg-purple hover:text-white transition-all duration-300 text-sm sm:text-base"
              >
                <span>{showAllHospitals ? 'Show Less' : `Show All ${filteredHospitals.length} Facilities`}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${showAllHospitals ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Community Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 md:hidden">
            You're Not Alone on This Journey
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=500&fit=crop&q=80"
                alt="Person climbing steps on a journey to recovery"
                className="rounded-2xl shadow-2xl w-full h-[250px] sm:h-[350px] md:h-auto object-cover"
              />
            </div>
            <div>
              <h2 className="hidden md:block text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                You're Not Alone on This Journey
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Substance use challenges can affect anyone, regardless of age, background, or circumstances. Our platform offers a safe, confidential, and supportive space to help you understand your relationship with alcohol or drugs and take the first step toward support.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you're concerned about substance use, feeling overwhelmed, or simply want to check in with yourself, we're here to guide you toward reliable information, screening tools, and supportive resources at your own pace.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(117, 223, 225, 0.15)' }}>
                  <svg className="w-5 h-5" style={{ color: '#124A66' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-gray-700">Evidence-Based</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(117, 223, 225, 0.15)' }}>
                  <svg className="w-5 h-5" style={{ color: '#124A66' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-gray-700">Culturally Sensitive</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(117, 223, 225, 0.15)' }}>
                  <svg className="w-5 h-5" style={{ color: '#124A66' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-gray-700">Compassionate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Simple, Confidential Process
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Four easy steps to get the support you need</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                number: '1',
                title: 'Take Screening',
                description: 'Answer questions about your mental health and well-being in a safe, private environment',
                bgColor: 'bg-purple/40'
              },
              {
                number: '2',
                title: 'Get Results',
                description: 'Receive detailed, supportive assessment with personalized AI-generated feedback',
                bgColor: 'bg-purple/60'
              },
              {
                number: '3',
                title: 'Chat with AI',
                description: 'Discuss your concerns with our empathetic AI support bot for guidance',
                bgColor: 'bg-purple/80'
              },
              {
                number: '4',
                title: 'Find Help',
                description: 'Get matched with professional resources and support services near you',
                bgColor: 'bg-purple'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${step.bgColor} text-white rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg`}>
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-purple-200 text-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Ready to Take the First Step?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-10 opacity-90">
            Start your free, confidential screening today. Your journey to wellness begins with a single step.
          </p>
          <button
            onClick={handleStartScreening}
            className="text-white px-8 sm:px-12 py-4 sm:py-5 rounded-lg text-base sm:text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
            style={{ backgroundColor: '#CDB4EC', color: 'black' }}
          >
            <span>Start Your Screening Now</span>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple/5 via-white to-teal/5 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Get Involved with ISSUP Nigeria</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Join a growing community of professionals and advocates dedicated to mental health and substance use prevention.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Contact Us */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sm:p-8">
              <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Reach ISSUP Nigeria</h3>
              <p className="text-gray-500 text-sm mb-7">Have questions, partnerships, or want to collaborate? We'd love to hear from you.</p>
              <div className="space-y-4">
                <a
                  href="mailto:issupnigeria@gmail.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple/5 border border-transparent hover:border-purple/20 text-gray-700 hover:text-purple transition-all group"
                >
                  <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-purple/30 transition-colors shadow-sm">
                    <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">issupnigeria@gmail.com</span>
                </a>
                <a
                  href="tel:+2348129378557"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple/5 border border-transparent hover:border-purple/20 text-gray-700 hover:text-purple transition-all group"
                >
                  <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-purple/30 transition-colors shadow-sm">
                    <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">+234 812 937 8557</span>
                </a>
              </div>
            </div>

            {/* Membership */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sm:p-8">
              <div className="w-12 h-12 bg-purple/10 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Become a Member</h3>
              <p className="text-gray-500 text-sm mb-7">Join a network of professionals committed to substance use prevention and mental health support across Nigeria and beyond.</p>
              <div className="space-y-3">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdEoLn2RryPmSnmO0NQqJVXYpbwFUq_FZzDKZpBZvGrCTlSLg/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-purple text-white rounded-xl px-5 py-3.5 font-semibold hover:bg-purple/90 transition-all shadow-sm"
                >
                  <span>Join ISSUP Nigeria</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://www.issup.net/membership/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full border-2 border-teal text-teal rounded-xl px-5 py-3.5 font-semibold hover:bg-teal/5 transition-all"
                >
                  <span>Join ISSUP International</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Crisis Banner */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="bg-red/5 border-l-4 border-red rounded-lg p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">In Crisis? Get Immediate Help</h3>
                <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg">
                  If you're experiencing a mental health emergency, please reach out immediately. Help is available 24/7.
                </p>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                    <a
                      href="https://wa.me/2348129378557"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 bg-green text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green/90 transition-colors font-semibold shadow-md text-sm sm:text-base"
                    >
                      <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>WhatsApp: +234 812 937 8557</span>
                    </a>
                    <a
                      href="tel:+2347046526817"
                      className="inline-flex items-center justify-center space-x-2 bg-red text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red/90 transition-colors font-semibold shadow-md text-sm sm:text-base"
                    >
                      <FaPhoneAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Call: +234 704 652 6817</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main Footer Content */}
          <div className="flex flex-col gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* VibeCheck Brand */}
            <div className="flex justify-center">
              <img
                src="/vibeCheck_logo.png"
                alt="VibeCheck"
                className="h-14 sm:h-16 w-auto"
              />
            </div>

            {/* Partner Logos - Equal Visibility with White Filter */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                A Collaborative Initiative By
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                <img
                  src="/publica_logo.png"
                  alt="Publica AI"
                  className="h-10 sm:h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
                <img
                  src="/issup_logo_full.png"
                  alt="ISSUP Nigeria"
                  className="h-10 sm:h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
                <img
                  src="/fnph_yaba_logo.png"
                  alt="Federal Neuropsychiatric Hospital Yaba"
                  className="h-10 sm:h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
                <img
                  src="/nigcomsat_logo.png"
                  alt="NIGCOMSAT"
                  className="h-8 sm:h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            {/* Donation - Support ISSUP Nigeria */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Support ISSUP Nigeria</p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="bg-gray-800 rounded-lg px-3 py-1.5">
                  <span className="text-gray-500">Account: </span>
                  <span className="text-gray-300 font-medium">Nigerian Society of Substance Use Prevention and Treatment Professionals</span>
                </span>
                <span className="bg-gray-800 rounded-lg px-3 py-1.5">
                  <span className="text-gray-500">Bank: </span>
                  <span className="text-gray-300 font-medium">GTB</span>
                </span>
                <span className="bg-gray-800 rounded-lg px-3 py-1.5">
                  <span className="text-gray-500">Acc. No: </span>
                  <span className="text-gray-300 font-mono font-bold tracking-wider">0458103259</span>
                </span>
              </div>
            </div>

            {/* Quick Links, Tagline, and Crisis - Row on larger screens */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              {/* Quick Links */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Home
                </button>
                <button
                  onClick={handleStartScreening}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Start Screening
                </button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  How It Works
                </button>
              </div>

              {/* Tagline - Center */}
              <p className="hidden md:block text-gray-500 text-sm text-center">
                VibeCheck - AI-powered mental health support for Nigeria
              </p>

              {/* Crisis Contacts - Compact */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="text-gray-500 text-xs sm:text-sm">Crisis:</span>
                <a
                  href="tel:+2347046526817"
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  <FaPhoneAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red" />
                  <span>+234 704 652 6817</span>
                </a>
                <a
                  href="https://wa.me/2348129378557"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  <FaWhatsapp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Divider & Copyright */}
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-500 text-xs">
              This tool is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-gray-600 text-xs">
              © 2026 VibeCheck. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default Home