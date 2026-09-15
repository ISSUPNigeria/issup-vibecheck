import { useState } from 'react'
import PropTypes from 'prop-types'

// ILO-aligned Employment Status categories
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed_full_time', label: 'Employed (Full-time)' },
  { value: 'employed_part_time', label: 'Employed (Part-time)' },
  { value: 'self_employed_employer', label: 'Self-employed (with employees)' },
  { value: 'self_employed_own_account', label: 'Self-employed (without employees)' },
  { value: 'casual_worker', label: 'Casual/Temporary Worker' },
  { value: 'apprentice', label: 'Apprentice/Intern' },
  { value: 'unemployed_seeking', label: 'Unemployed (actively seeking work)' },
  { value: 'unemployed_not_seeking', label: 'Unemployed (not seeking work)' },
  { value: 'student', label: 'Student' },
  { value: 'homemaker', label: 'Homemaker/Caregiver' },
  { value: 'retired', label: 'Retired' },
  { value: 'unable_to_work', label: 'Unable to work (health reasons)' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
]

// ILO-aligned Employment Sectors (ISIC Rev.4 based)
const EMPLOYMENT_SECTOR_OPTIONS = [
  { value: 'agriculture', label: 'Agriculture, Forestry & Fishing' },
  { value: 'mining', label: 'Mining & Quarrying' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'construction', label: 'Construction' },
  { value: 'trade_commerce', label: 'Trade & Commerce (Wholesale/Retail)' },
  { value: 'transportation', label: 'Transportation & Storage' },
  { value: 'accommodation_food', label: 'Accommodation & Food Services' },
  { value: 'information_communication', label: 'Information & Communication (IT)' },
  { value: 'finance_insurance', label: 'Finance & Insurance' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'professional_technical', label: 'Professional & Technical Services' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare & Social Services' },
  { value: 'arts_entertainment', label: 'Arts, Entertainment & Recreation' },
  { value: 'government_public', label: 'Government & Public Administration' },
  { value: 'domestic_household', label: 'Domestic/Household Services' },
  { value: 'ngo_nonprofit', label: 'NGO/Non-profit Organization' },
  { value: 'religious_organization', label: 'Religious Organization' },
  { value: 'other', label: 'Other' }
]

// Employment statuses that should show the sector dropdown
const STATUSES_REQUIRING_SECTOR = [
  'employed_full_time',
  'employed_part_time',
  'self_employed_employer',
  'self_employed_own_account',
  'casual_worker',
  'apprentice'
]

// Nigerian states
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

function DemographicsStep({ demographics, onUpdate, onComplete }) {
  const [formData, setFormData] = useState(demographics || {
    age: '',
    gender: '',
    city: '',
    state: '',
    religion: '',
    employment_status: '',
    employment_sector: '',
    marital_status: ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    setErrors({ ...errors, [field]: '' })
    onUpdate({ ...formData, [field]: value })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.age || formData.age < 13 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age (13-120)'
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender'
    }
    if (!formData.city) {
      newErrors.city = 'Please enter your city'
    }
    if (!formData.state) {
      newErrors.state = 'Please select your state'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onComplete(formData)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">About You</h2>
          <p className="text-sm sm:text-base text-gray-600">
            This information helps us provide better support and connect you with appropriate resources.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age <span className="text-red">*</span>
            </label>
            <input
              type="number"
              min="13"
              max="120"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.age ? 'border-red' : 'border-gray-300'
              }`}
              placeholder="Enter your age"
            />
            {errors.age && <p className="text-red text-sm mt-1">{errors.age}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.gender ? 'border-red' : 'border-gray-300'
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="text-red text-sm mt-1">{errors.gender}</p>}
          </div>

          {/* Location - City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.city ? 'border-red' : 'border-gray-300'
              }`}
              placeholder="e.g., Ikeja, Wuse, Port Harcourt"
            />
            {errors.city && <p className="text-red text-sm mt-1">{errors.city}</p>}
          </div>

          {/* Location - State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red">*</span>
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.state ? 'border-red' : 'border-gray-300'
              }`}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-red text-sm mt-1">{errors.state}</p>}
          </div>

          {/* Religion (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Religion <span className="text-gray-400">(Optional)</span>
            </label>
            <select
              value={formData.religion}
              onChange={(e) => handleChange('religion', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50"
            >
              <option value="">Select religion</option>
              <option value="christianity">Christianity</option>
              <option value="islam">Islam</option>
              <option value="traditional">Traditional Religion</option>
              <option value="other">Other</option>
              <option value="none">None</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Status <span className="text-gray-400">(Optional)</span>
            </label>
            <select
              value={formData.employment_status}
              onChange={(e) => {
                handleChange('employment_status', e.target.value)
                // Clear sector if status doesn't require it
                if (!STATUSES_REQUIRING_SECTOR.includes(e.target.value)) {
                  handleChange('employment_sector', '')
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50"
            >
              <option value="">Select employment status</option>
              {EMPLOYMENT_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Employment Sector - Only shown for employed/self-employed statuses */}
          {STATUSES_REQUIRING_SECTOR.includes(formData.employment_status) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Sector <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                value={formData.employment_sector}
                onChange={(e) => handleChange('employment_sector', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50"
              >
                <option value="">Select your sector/industry</option>
                {EMPLOYMENT_SECTOR_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marital Status <span className="text-gray-400">(Optional)</span>
            </label>
            <select
              value={formData.marital_status}
              onChange={(e) => handleChange('marital_status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50"
            >
              <option value="">Select marital status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="separated">Separated</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs sm:text-sm text-blue-900">
                  <strong>Privacy:</strong> Your information is anonymous and temporary.
                  It will be used only to provide personalized support and will not be stored permanently.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-purple/90 transition-colors shadow-md hover:shadow-lg text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
          >
            Continue to Screening
          </button>
        </form>
      </div>
    </div>
  )
}

DemographicsStep.propTypes = {
  demographics: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired
}

export default DemographicsStep
