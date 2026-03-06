import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'

export default function ContractGenerator() {
  const { user, customerForContract, estimateForContract } = useAppStore()
  
  const [mobileTab, setMobileTab] = useState('setup')
  const [prospects, setProspects] = useState([])

  useEffect(() => {
    const savedProspects = localStorage.getItem('stardustProspects')
    if (savedProspects) {
      setProspects(JSON.parse(savedProspects))
    }
  }, [])

  const [customer, setCustomer] = useState({
    id: '', name: '', address: '', city: '', postal: '', phone: '', email: ''
  })
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [isManualCustomer, setIsManualCustomer] = useState(false)

  const [estimate, setEstimate] = useState(estimateForContract || {
    kw: 0, mountType: "Roof", sysType: "Grid-Tied", panel: "TBD", inverter: "TBD", batteryKwh: 0, subTotal: 0, discount: 0
  })
  const [isManualEstimate, setIsManualEstimate] = useState(false)

  const [savedEstimatesList, setSavedEstimatesList] = useState([])
  const [estimateSearchQuery, setEstimateSearchQuery] = useState('')
  const [estimateSortOrder, setEstimateSortOrder] = useState('newest')

  useEffect(() => {
    setSavedEstimatesList(JSON.parse(localStorage.getItem('stardustEstimates') || '[]'))
    if (customerForContract) setCustomer(customerForContract)
  }, [customerForContract]) 

  const handleSelectEstimate = (est) => {
    setEstimate(est)
    setIsManualEstimate(false)
  }
  
  const handleSelectCustomer = (prospect) => {
    setCustomer(prospect)
    setIsManualCustomer(false)
  }

  const handleManualEstimateChange = (e) => {
    const { name, value } = e.target
    setEstimate(prev => ({
      ...prev,
      [name]: ['kw', 'batteryKwh', 'subTotal', 'discount'].includes(name) ? (parseFloat(value) || 0) : value
    }))
  }

  const handleManualCustomerChange = (e) => {
    const { name, value } = e.target
    setCustomer(prev => ({ ...prev, [name]: value, id: 'manual' }))
  }

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  
  const taxRate = 0.13
  const tax = (estimate.subTotal || 0) * taxRate
  const total = (estimate.subTotal || 0) + tax

  const deposit = total * 0.15
  const progressPayment = total * 0.40
  const finalPayment = total * 0.45
  const securityDeposit = total * 0.1799

  const handlePrint = () => window.print()

  const filteredAndSortedEstimates = savedEstimatesList
    .filter(est => est.name.toLowerCase().includes(estimateSearchQuery.toLowerCase()))
    .sort((a, b) => {
      if (estimateSortOrder === 'newest') return b.id - a.id
      if (estimateSortOrder === 'oldest') return a.id - b.id
      if (estimateSortOrder === 'price-high') return b.subTotal - a.subTotal
      if (estimateSortOrder === 'price-low') return a.subTotal - b.subTotal
      if (estimateSortOrder === 'az') return a.name.localeCompare(b.name)
      return 0
    })

  const filteredProspects = prospects.filter(p => 
    p.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
    (p.address && p.address.toLowerCase().includes(customerSearchQuery.toLowerCase()))
  )

  const isContractReady = customer.name && estimate.subTotal > 0

  return (
    /* DESKTOP FIX: 'md:relative' and 'md:bg-slate-50' restores your original look.
       MOBILE STAY: 'fixed inset-0' and 'bg-slate-950' keeps the cockpit view for iPhone.
    */
    <div className="fixed inset-0 bg-slate-950 text-slate-300 font-sans overflow-y-auto md:relative md:inset-auto md:bg-slate-50 md:text-slate-800 print:static print:bg-white print:text-black">
      
      {/* DESKTOP FIX: 'md:items-start' and 'md:mx-0' removes the forced centering on PC. 
      */}
      <div className="flex flex-col items-center w-full min-h-screen p-4 md:p-8 lg:p-12 pb-32 md:items-start md:max-w-none md:mx-0">
        
        {/* Header Section */}
        <div className="w-full max-w-6xl flex flex-col items-center justify-center mb-10 md:items-start md:justify-start print:hidden">
          <h2 className="text-3xl md:text-5xl font-black text-white md:text-slate-900 mb-4 tracking-tight text-center md:text-left">Contract Generator</h2>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
            {estimate.subTotal === 0 && (
               <p className="text-orange-400 font-bold text-xs md:text-sm bg-orange-900/30 md:bg-orange-100 md:text-orange-700 px-4 py-2 rounded-full border border-orange-800/50 md:border-orange-200 shadow-sm flex items-center gap-2">
                 <i className="fas fa-exclamation-triangle"></i> No active estimate
               </p>
            )}
            {!customer.name && (
               <p className="text-red-400 font-bold text-xs md:text-sm bg-red-900/30 md:bg-red-100 md:text-red-700 px-4 py-2 rounded-full border border-red-800/50 md:border-red-200 shadow-sm flex items-center gap-2">
                 <i className="fas fa-user-times"></i> No customer selected
               </p>
            )}
          </div>

          <button 
            onClick={handlePrint} 
            disabled={!isContractReady}
            className={`bg-gradient-to-br from-blue-600 to-blue-800 text-white px-8 py-4 rounded-full font-black shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed items-center justify-center gap-2 ${mobileTab === 'preview' ? 'flex w-full md:w-auto' : 'hidden md:flex'}`}
          >
            <i className="fas fa-print"></i> Print / Save PDF
          </button>
        </div>

        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 justify-center items-start md:justify-start print:block print:w-full">
          
          {/* LEFT COLUMN: Controls */}
          <div className={`w-full lg:w-[35%] space-y-6 print:hidden ${mobileTab === 'setup' ? 'block' : 'hidden lg:block'}`}>
            
            {/* ESTIMATE SELECTOR BOX */}
            <div className="bg-slate-900 md:bg-white p-6 rounded-3xl shadow-lg border border-slate-800 md:border-slate-200 border-t-4 border-t-yellow-400">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-yellow-400 md:text-yellow-600 text-sm uppercase tracking-widest flex items-center">
                  <i className="fas fa-file-invoice-dollar mr-2 text-lg"></i>1. Estimate
                </h3>
                <button 
                  onClick={() => setIsManualEstimate(!isManualEstimate)}
                  className="text-xs text-slate-400 md:text-slate-500 hover:text-blue-600 underline font-bold"
                >
                  {isManualEstimate ? 'Search Saved' : 'Manual Entry'}
                </button>
              </div>
              
              {!isManualEstimate ? (
                <>
                  <input 
                    type="text" 
                    placeholder="Search estimates..." 
                    value={estimateSearchQuery}
                    onChange={(e) => setEstimateSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-xl text-sm text-white md:text-slate-900 mb-3"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredAndSortedEstimates.map(est => (
                      <button 
                        key={est.id}
                        onClick={() => handleSelectEstimate(est)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${estimate.id === est.id ? 'bg-yellow-900/20 md:bg-yellow-50 border-yellow-500' : 'bg-slate-950 md:bg-white border-slate-800 md:border-slate-100'}`}
                      >
                        <span className="font-bold text-white md:text-slate-900 text-sm block">{est.name}</span>
                        <span className="text-xs text-slate-400 md:text-slate-500">{est.date} • {est.kw}kW</span>
                        <span className="text-green-400 md:text-green-600 font-black block mt-1">{fmt.format(est.subTotal)}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" name="kw" placeholder="kW" value={estimate.kw || ''} onChange={handleManualEstimateChange} className="col-span-1 px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900" />
                  <select name="mountType" value={estimate.mountType} onChange={handleManualEstimateChange} className="col-span-1 px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900">
                    <option value="Roof">Roof</option>
                    <option value="Ground">Ground</option>
                  </select>
                  <input type="number" name="subTotal" placeholder="Sub-Total ($)" value={estimate.subTotal || ''} onChange={handleManualEstimateChange} className="col-span-2 px-3 py-2 bg-slate-950 md:bg-slate-50 border border-yellow-500 rounded-lg text-white md:text-slate-900 font-bold" />
                </div>
              )}
            </div>

            {/* CUSTOMER SELECTOR BOX */}
            <div className="bg-slate-900 md:bg-white p-6 rounded-3xl shadow-lg border border-slate-800 md:border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-xl text-blue-400 md:text-blue-600 flex items-center">
                  <i className="fas fa-address-book mr-2"></i>2. Customer
                </h3>
                <button 
                  onClick={() => setIsManualCustomer(!isManualCustomer)}
                  className="text-xs text-slate-400 md:text-slate-500 hover:text-blue-600 underline font-bold"
                >
                  {isManualCustomer ? 'Search CRM' : 'Manual Entry'}
                </button>
              </div>
              
              {!isManualCustomer ? (
                <>
                  <input 
                    type="text" 
                    placeholder="Search by name..." 
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-xl text-sm text-white md:text-slate-900 mb-3"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {filteredProspects.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => handleSelectCustomer(p)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${customer.id === p.id ? 'bg-blue-900/30 md:bg-blue-50 border-blue-500' : 'bg-slate-950 md:bg-white border-slate-800 md:border-slate-100'}`}
                      >
                        <span className="font-bold text-white md:text-slate-900 text-sm block">{p.name}</span>
                        <span className="text-xs text-slate-500 truncate block">{p.address}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <input type="text" name="name" placeholder="Full Name" value={customer.name} onChange={handleManualCustomerChange} className="w-full px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900" />
                  <input type="text" name="address" placeholder="Address" value={customer.address} onChange={handleManualCustomerChange} className="w-full px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900" />
                  <input type="email" name="email" placeholder="Email" value={customer.email} onChange={handleManualCustomerChange} className="w-full px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900" />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: The actual contract */}
          <div className={`w-full lg:w-[65%] bg-slate-900 md:bg-white p-6 md:p-12 rounded-3xl shadow-2xl border border-slate-800 md:border-slate-200 text-slate-300 md:text-slate-800 font-serif text-[13px] md:text-sm leading-relaxed print:bg-white print:text-black print:p-0 print:shadow-none print:border-none ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
            
            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between mb-8 border-b-2 border-slate-700 md:border-slate-300 pb-6 print:border-black">
              <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-4 text-white md:text-slate-900 print:text-black">Solar Installation Agreement</h1>
                <p className="font-bold text-lg text-white md:text-slate-900 print:text-black">{customer.name || '[Client Name]'}</p>
                <p>{customer.address || '[Address]'}</p>
                <p>{customer.city || '[City]'}, {customer.postal || '[Postal]'}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-slate-400 md:text-slate-600"><strong>Date:</strong> {currentDate}</p>
                <div className="mt-4 pt-4 border-t border-slate-700 md:border-slate-200 print:border-black text-xs">
                  <p className="font-bold text-white md:text-slate-900 print:text-black italic">Stardust Solar Temiskaming</p>
                  <p>Mason Greene</p>
                  <p>mason.greene@stardustsolar.com</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-base font-bold border-b border-slate-700 md:border-slate-300 print:border-black mb-3 uppercase text-white md:text-slate-900 print:text-black">Scope of Work</h2>
              <p><strong>Your Solar PV System:</strong> We will determine and confirm the optimum location for your solar panels on the property.</p>
              <p><strong>System Details:</strong> {estimate.mountType} Mounted {estimate.kw}kW Solar(PV) {estimate.sysType} System.</p>
              <p><strong>Equipment:</strong> {estimate.panel} & {estimate.inverter} (or equivalent).</p>
            </div>

            <div className="mb-6 space-y-4 text-justify">
              <h2 className="text-base font-bold border-b border-slate-700 md:border-slate-300 print:border-black mb-3 uppercase text-white md:text-slate-900 print:text-black">Standard Terms</h2>
              <p><strong>Warranty:</strong> 5-Year Workmanship Warranty on labor, in addition to manufacturer’s warranties. 5-Year Roof Warranty pending inspection.</p>
              <p><strong>Debris Removal:</strong> We will remove all installation debris and leave the premises in clean condition.</p>
              <p><strong>Access:</strong> Customer grants Stardust Solar free access to the property and electrical panel during business hours.</p>
              <p><strong>Cancellation:</strong> Refundable less permit fees and 25% restocking fee on materials if cancelled before installation start.</p>
            </div>

            {/* Pricing Table */}
            <div className="mb-6 pt-6">
              <h2 className="text-base font-bold border-b border-slate-700 md:border-slate-300 print:border-black mb-4 uppercase text-white md:text-slate-900 print:text-black">Pricing Summary</h2>
              <div className="bg-slate-950 md:bg-slate-50 p-6 border border-slate-800 md:border-slate-200 rounded-2xl print:bg-white print:border-black">
                <div className="space-y-2 text-base">
                  <div className="flex justify-between border-b border-slate-800 md:border-slate-200 pb-2">
                    <span className="text-slate-400 md:text-slate-500">Sub-Total:</span>
                    <span className="font-bold text-white md:text-slate-900 print:text-black">{fmt.format(estimate.subTotal)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 md:border-slate-200 pb-2">
                    <span className="text-slate-400 md:text-slate-500">Tax (13%):</span>
                    <span className="text-slate-400 md:text-slate-500">{fmt.format(tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl pt-2">
                    <span className="font-bold text-white md:text-slate-900 print:text-black">Total Price:</span>
                    <span className="font-black text-green-400 md:text-green-600 print:text-black">{fmt.format(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Schedules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-2 uppercase text-xs text-slate-500">Standard Payment</h3>
                <ul className="text-xs space-y-1">
                  <li><strong>15% Deposit:</strong> {fmt.format(deposit)}</li>
                  <li><strong>40% Progress:</strong> {fmt.format(progressPayment)}</li>
                  <li><strong>45% Final:</strong> {fmt.format(finalPayment)}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2 uppercase text-xs text-slate-500">Financing Option</h3>
                <p className="text-xs"><strong>17.99% Security Deposit:</strong> {fmt.format(securityDeposit)}</p>
                <p className="text-[10px] text-slate-500 mt-1 italic">Refundable upon job completion, less 2.99% finance fee.</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-12 grid grid-cols-2 gap-12 border-t-2 border-slate-700 md:border-slate-300 pt-8 print:border-black">
              <div>
                <div className="border-b border-slate-600 md:border-slate-400 h-8 mb-2"></div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Customer Signature</p>
                <p className="font-bold mt-2 text-white md:text-slate-900 print:text-black">{customer.name || '---'}</p>
              </div>
              <div>
                <div className="border-b border-slate-600 md:border-slate-400 h-8 mb-2"></div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Representative Signature</p>
                <p className="font-bold mt-2 text-white md:text-slate-900 print:text-black">Mason Greene</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE NAV: iPhone Style Floating Bar (Stays Dark) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full flex items-center p-2 shadow-2xl z-[100] print:hidden">
        <button 
          onClick={() => setMobileTab('setup')}
          className={`flex-1 h-full rounded-full font-black text-xs uppercase tracking-widest transition-all ${mobileTab === 'setup' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          Setup
        </button>
        <button 
          onClick={() => setMobileTab('preview')}
          className={`flex-1 h-full rounded-full font-black text-xs uppercase tracking-widest transition-all ${mobileTab === 'preview' ? 'bg-green-600 text-white' : 'text-slate-400'}`}
        >
          Preview
        </button>
      </div>
    </div>
  )
}