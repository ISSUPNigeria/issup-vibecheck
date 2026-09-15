import Header from '../components/shared/Header'
import ValidatedScreeningFlow from '../components/screening/ValidatedScreeningFlow'

function Screening() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ValidatedScreeningFlow />
    </div>
  )
}

export default Screening
