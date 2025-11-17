'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import configData from '../config/domain-config.json'

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
  loading: () => <div className="h-20 bg-gray-100 animate-pulse rounded"></div>
})

const config = configData as DomainConfig

interface FormData {
  name: string
  email: string
  phone: string
  message: string
  offer: string
}

interface DomainConfig {
  seo: {
    title: string
    description: string
    keywords: string
    ogImage: string
    favicon: string
  }
  domain: {
    name: string
    price: string
    priceNumeric: number
    currency: string
    showPrice: boolean
    showInquiryForm: boolean
    headline: string
    description: string
  }
  contact: {
    email: string
    name: string
    responseTime: string
  }
  otherDomains: {
    name: string
    url: string
  }[]
  recaptcha: {
    siteKey: string
  }
  emailjs: {
    enabled: boolean
    publicKey: string
    serviceId: string
    templateId: string
    toEmail: string
  }
  analytics: {
    googleAnalytics: {
      enabled: boolean
      trackingId: string
    }
  }
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    offer: ''
  })
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showOtherDomains, setShowOtherDomains] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCloseOtherDomains = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowOtherDomains(false)
      setIsClosing(false)
    }, 300) // Match the transition duration
  }

  const sendEmailNotification = async (formData: FormData, captchaToken: string) => {
    if (!config.emailjs.enabled) return

    try {
      // Dynamically import emailjs to avoid SSR issues
      const emailjs = (await import('@emailjs/browser')).default
      
      // Initialize EmailJS with your public key
      emailjs.init(config.emailjs.publicKey)

      const templateParams = {
        from_name: formData.name,
        reply_to: formData.email,
        phone: formData.phone || 'Not provided',
        offer: formData.offer || 'Not specified',
        currency: config.domain.currency,
        message: formData.message,
        domain_name: config.domain.name,
        submission_date: new Date().toLocaleString(),
        to_email: config.emailjs.toEmail
      }

      const result = await emailjs.send(
        config.emailjs.serviceId,
        config.emailjs.templateId,
        templateParams
      )

      console.log('Email sent successfully:', result.text)
      return { success: true }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Only allow numbers for the offer field
    if (name === 'offer') {
      const numericValue = value.replace(/[^0-9]/g, '')
      setFormData(prev => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) {
      alert('Please complete the CAPTCHA')
      return
    }

    setIsSubmitting(true)
    
    // Send email notification via EmailJS
    const emailResult = await sendEmailNotification(formData, captchaToken)
    
    if (emailResult?.success) {
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '', offer: '' })
      setCaptchaToken(null)
      console.log('✅ Inquiry submitted successfully via EmailJS')
    } else {
      alert('There was an error submitting your inquiry. Please check your EmailJS configuration and try again.')
      console.error('EmailJS error:', emailResult?.error)
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="card p-8 mb-8 fade-in">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 break-words">
                  <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-teal-600 bg-clip-text text-transparent">
                    {config.domain.name}
                  </span>
                  <span className="block sm:inline text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-pulse mt-2 sm:mt-0 sm:ml-3">
                    is for SALE!
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {config.domain.headline}
                </p>
                {config.domain.showPrice && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                      {config.domain.price}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {config.domain.currency}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-4">
                  {config.domain.showInquiryForm && (
                    <button 
                      className="btn-primary" 
                      onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Make an Offer
                    </button>
                  )}
                  <button 
                    className="btn-secondary" 
                    onClick={() => window.location.href = `mailto:${config.contact.email}?subject=Inquiry about ${config.domain.name}`}
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>

            {/* Domain Description */}
            <div className="card p-8 mb-8 slide-up animation-delay-200">
              <h2 className="text-2xl font-bold mb-6">Why This Domain?</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {config.domain.description}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            {config.domain.showInquiryForm && (
            <div id="contact-form" className="card p-8 slide-up animation-delay-400">
              <h2 className="text-2xl font-bold mb-6">Make an Inquiry</h2>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">Thank You!</h3>
                  <p className="text-gray-700 font-medium">Your inquiry has been submitted successfully. We&apos;ll get back to you within {config.contact.responseTime}.</p>
                </div>
                              ) : (
                  <>
                    <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="offer" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Offer (USD)
                      </label>
                      <input
                        type="text"
                        id="offer"
                        name="offer"
                        value={formData.offer}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder={config.domain.priceNumeric.toString()}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Tell us about your project and how you plan to use this domain"
                      rows={4}
                    />
                  </div>
                  
                  <div className="mb-6">
                    {isMounted && (
                      <ReCAPTCHA
                        sitekey={config.recaptcha.siteKey}
                        onChange={(token) => setCaptchaToken(token)}
                        onExpired={() => setCaptchaToken(null)}
                      />
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !captchaToken}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
                  </button>
                </form>
                  </>
              )}
            </div>
            )}      </div>

      {/* Floating Widget for Other Domains - Desktop */}
      <div className="hidden lg:block fixed left-0 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={() => setShowOtherDomains(true)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-2 py-8 rounded-r-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
        >
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div className="text-xs font-medium leading-tight">
              <div className="flex flex-col items-center">
                {'Other'.split('').map((letter, index) => (
                  <span key={index} className="block">{letter}</span>
                ))}
              </div>
              <div className="flex flex-col items-center mt-3">
                {'domains'.split('').map((letter, index) => (
                  <span key={index} className="block">{letter}</span>
                ))}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Floating Widget for Other Domains - Mobile */}
      <div className="lg:hidden fixed left-0 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={() => setShowOtherDomains(true)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-1.5 py-6 rounded-r-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
        >
          <div className="flex flex-col items-center space-y-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
                         <div className="text-xs font-medium leading-tight">
               <div className="flex flex-col items-center">
                 {'Other'.split('').map((letter, index) => (
                   <span key={index} className="block text-xs">{letter}</span>
                 ))}
               </div>
               <div className="flex flex-col items-center mt-3">
                 {'domains'.split('').map((letter, index) => (
                   <span key={index} className="block text-xs">{letter}</span>
                 ))}
               </div>
             </div>
          </div>
        </button>
      </div>

      {/* Other Domains Sidebar Overlay */}
      {(showOtherDomains || isClosing) && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with fade animation */}
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
              showOtherDomains && !isClosing ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={handleCloseOtherDomains} 
          />
          
          {/* Sidebar panel with slide animation from left */}
          <div className={`absolute left-0 top-0 h-full w-96 max-w-full bg-white shadow-2xl transform transition-all duration-300 ease-in-out ${
            showOtherDomains && !isClosing ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}>
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                  Other Premium Domains
                </h2>
                <button
                  onClick={handleCloseOtherDomains}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:bg-gray-100 rounded-full p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {config.otherDomains.map((domain, index) => (
                  <div 
                    key={index} 
                    className="card p-4 border-l-4 border-blue-500 transform transition-all duration-200 hover:scale-102"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: showOtherDomains && !isClosing ? 'slideInLeft 0.4s ease-out forwards' : 'none'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-900">{domain.name}</h3>
                      <a 
                        href={domain.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg inline-block"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(domain.url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        Inquire
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-teal-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
                      <p className="text-gray-300">
              © {new Date().getFullYear()} {config.domain.name}. All rights reserved. | 
              <span className="ml-1">
                Powered by <a href="https://github.com/vireshshah/domain-for-sale-boilerplate" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 hover:underline">Domain For Sale Boilerplate</a>
              </span>
            </p>
        </div>
      </footer>
    </div>
  )
} 