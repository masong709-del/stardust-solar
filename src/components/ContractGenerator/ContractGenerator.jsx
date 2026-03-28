import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'

export default function ContractGenerator() {
  const { user, customerForContract, estimateForContract } = useAppStore()
  
  const [mobileTab, setMobileTab] = useState('setup')
  const [prospects, setProspects] = useState([])

  useEffect(() => {
    const savedProspects = localStorage.getItem('stardust_prospects')
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
    <div className="fixed inset-0 bg-slate-950 text-slate-300 font-sans overflow-y-auto md:relative md:inset-auto md:bg-slate-50 md:text-slate-800 print:static print:bg-white print:text-black print:overflow-visible">
      
      <div className="flex flex-col items-center w-full min-h-screen p-4 md:p-8 lg:p-12 pb-32 md:items-start md:max-w-none md:mx-0 print:p-0 print:m-0">
        
        {/* Header Section (Hidden on Print) */}
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

        <div className="w-full flex flex-col lg:flex-row gap-8 justify-center items-start md:justify-start print:block print:w-full print:gap-0">
          
          {/* LEFT COLUMN: Controls (Hidden on Print) */}
          <div className={`w-full lg:w-[35%] max-w-md space-y-6 print:hidden ${mobileTab === 'setup' ? 'block' : 'hidden lg:block'}`}>
            
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
                    className="w-full px-4 py-3 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-xl text-sm text-white md:text-slate-900 mb-3 focus:outline-none focus:border-yellow-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-xl text-sm text-white md:text-slate-900 mb-3 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
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
                  <input type="text" name="city" placeholder="City" value={customer.city} onChange={handleManualCustomerChange} className="w-full px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900" />
                  <input type="text" name="postal" placeholder="Postal Code" value={customer.postal} onChange={handleManualCustomerChange} className="w-full px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900" />
                  <input type="email" name="email" placeholder="Email" value={customer.email} onChange={handleManualCustomerChange} className="w-full px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900" />
                  <input type="tel" name="phone" placeholder="Phone" value={customer.phone} onChange={handleManualCustomerChange} className="w-full px-3 py-2 bg-slate-950 md:bg-slate-50 border border-slate-700 md:border-slate-200 rounded-lg text-white md:text-slate-900" />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: THE PRINT-FRIENDLY CONTRACT DOCUMENT */}
          <div className={`w-full lg:flex-1 max-w-[8.5in] mx-auto bg-white text-black p-8 md:p-14 shadow-2xl print:shadow-none print:p-0 print:m-0 print:w-full border border-slate-200 print:border-none font-sans text-[13px] leading-relaxed ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
            
            {/* Header Data */}
            <div className="mb-10 border-b-2 border-slate-800 pb-8">
              <h1 className="text-3xl font-black tracking-widest uppercase mb-1 text-slate-900 print:text-black">STARDUST SOLAR</h1>
              <h2 className="text-xl text-slate-600 print:text-slate-800 uppercase tracking-wider font-bold mb-8">Solar PV System Agreement</h2>
              
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-1">
                  <p className="font-bold text-base text-slate-900 print:text-black">{customer.name || '[Customer Name]'}</p>
                  <p>{customer.address || '[Address]'}</p>
                  <p>{customer.city ? `${customer.city}, ON` : '[City], ON'}</p>
                  <p>{customer.postal || '[Postal Code]'}</p>
                  <p className="pt-4 text-slate-600 print:text-slate-800 font-bold">Offer Valid For: <span className="font-normal text-black">30-Days</span></p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-bold text-slate-900 print:text-black mb-4">{currentDate}</p>
                  <div className="pt-2 text-slate-600 print:text-slate-800">
                    <p className="font-bold mb-1">Prepared By:</p>
                    <p className="text-black">Mason Greene</p>
                    <p className="text-black">mason.greene@stardustsolar.com</p>
                    <p className="text-black">(705) 622-0687</p>
                    <p className="font-bold text-black mt-2">Stardust Solar Temiskaming</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              
              <section className="print:break-inside-avoid">
                <h3 className="font-bold border-b border-slate-300 print:border-black mb-3 text-slate-900 print:text-black text-lg uppercase tracking-wide">Scope of Work</h3>
                <h4 className="font-bold italic text-sm mb-2 text-slate-800 print:text-black">Your Solar PV System:</h4>
                <p className="mb-3 text-slate-700 print:text-black">We will determine and confirm the optimum location for your solar panels on the property.</p>
                <div className="bg-slate-50 print:bg-transparent print:border print:border-slate-300 p-4 rounded-lg mb-3">
                  <p className="font-bold text-slate-900 print:text-black mb-1">Solar Panel System:</p>
                  <p className="text-slate-700 print:text-black mb-3">{estimate.mountType} Mounted {estimate.kw}kW Solar (PV) {estimate.sysType} System{estimate.batteryKwh > 0 ? ` with ${estimate.batteryKwh} kWh` : ''}.</p>
                  <p className="font-bold text-slate-900 print:text-black mb-1">Solar Panel Details:</p>
                  <p className="text-slate-700 print:text-black">{estimate.panel} & {estimate.inverter} (or equivalent, solar panel power rating may vary by up to 2.5%).</p>
                </div>
                <p className="mb-2 text-slate-700 print:text-black">Our systems include web monitoring devices and setup so that the system owner can see how much the system is generating over time and at any given time.</p>
                <p className="mb-2 text-slate-700 print:text-black">Our systems include equipment, wiring, and devices necessary to make a functioning system complete.</p>
                <p className="text-slate-700 print:text-black">Our systems include planning, design, permitting, installation, labor, system connection, set-up, and testing.</p>
              </section>

              <section>
                <h3 className="font-bold border-b border-slate-300 print:border-black mb-4 text-slate-900 print:text-black text-lg uppercase tracking-wide">Notes</h3>
                
                <div className="space-y-4">
                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Confidentiality</h4>
                    <p className="text-slate-700 print:text-black">This Confidential Proposal has been proposed exclusively for you. This remains the property of Stardust Solar until accepted and may not be given to or shown to any other person or company.</p>
                  </div>
                  
                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Warranty</h4>
                    <p className="text-slate-700 print:text-black mb-2">All Stardust Solar crews working on your roof and your electrical system are certified. We are so confident in our work that we offer you a 5-Year Workmanship Warranty on our labor, in addition to the manufacturer's warranties on the equipment installed.</p>
                    <p className="text-slate-700 print:text-black">As well, we offer a 5-Year Roof Warranty along with your solar and workmanship warranties, pending a roofing inspection. This covers you for any leaks as a result of our work on your solar roof faces.</p>
                  </div>

                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Insurance</h4>
                    <p className="text-slate-700 print:text-black">Our company carries a minimum of $5 million in commercial liability and ensures workers are registered in accordance with local occupational health and safety and workers compensation requirements. It is the responsibility of the customer to ensure that they carry comprehensive liability cover in excess of $5 million if they so require.</p>
                  </div>

                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Debris Removal</h4>
                    <p className="text-slate-700 print:text-black">It is our goal to remove all debris and leave premises in clean condition without damage to the surrounding property, and to restore any landscaping to its original condition.</p>
                  </div>
                </div>
              </section>

              <section className="print:break-before-page pt-4">
                <div className="space-y-4">
                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Access to Property</h4>
                    <p className="text-slate-700 print:text-black">This agreement is based on the assumption that we, along with necessary associates and inspectors, will have free access to the property, electrical panel, and wiring routes during regular business hours. Notice and request for access will be given and confirmed by the customer.</p>
                  </div>

                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Incentive and Financing</h4>
                    <p className="text-slate-700 print:text-black">We will provide support to help customers navigate government incentives programs and financing options. Approvals and costs of government incentive and financing approvals are the responsibility of the customer, and any financing terms will be set out in a separate financing agreement between the customer and finance company.</p>
                  </div>

                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Project Timing</h4>
                    <p className="text-slate-700 print:text-black">Due to the uncertainty of weather conditions, material supplies, and shipping delays it is not possible to give an exact start date or completion date, however our projects are as a rule completed on a 'first come first serve basis', and we will always do our best to get to your project in a timely manner. However, due to such variables, any start date given whether verbal or written are to be considered tentative and cannot be guaranteed.</p>
                  </div>

                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Work Quality</h4>
                    <p className="text-slate-700 print:text-black">Our work will be completed in a quality manner and in compliance with all building and electrical codes, all other applicable laws, and all applicable utility requirements, including appropriate utility interconnection obligations.</p>
                  </div>

                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Change Orders</h4>
                    <p className="text-slate-700 print:text-black">Due to possible unforeseen circumstances such as physical obstacles to solar panel locations, problems with the existing electrical system, or late progress payments causing delays and material price changes, we may need to make changes to the scope of work or adjustments to the price or payment structure. All change orders will be provided to customers for approval before proceeding.</p>
                  </div>

                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Payment Schedule</h4>
                    <p className="text-slate-700 print:text-black">We require progress payments at certain stages of the project in order to proceed. See Pricing Summary for progress payments terms and amounts. Failure to make progress payments or approve financing payments may result in stop-work, stop-progress orders, project delays, and/or additional costs.</p>
                  </div>

                  <div className="print:break-inside-avoid">
                    <h4 className="font-bold text-slate-900 print:text-black mb-1">Cancellation</h4>
                    <p className="text-slate-700 print:text-black">The customer may cancel the installation during any stage of the project. If the customer cancels prior to the installation start-date, any deposits and progress payments are fully refundable, less any permit fees or other expenses incurred, and a 25% restocking fee on any solar equipment & materials purchased. If the customer cancels after the physical installation has begun, no refunds will be available. Security deposits for financing customers will be fully refundable on completion of the job, less any remaining balance owing.</p>
                  </div>
                </div>
              </section>

              <section className="print:break-before-page pt-4">
                <h3 className="font-bold border-b border-slate-300 print:border-black mb-4 text-slate-900 print:text-black text-lg uppercase tracking-wide">Pricing Summary</h3>
                <p className="mb-4 text-slate-700 print:text-black">The following is a summary of pricing for this proposal, subject to the validity period, and otherwise subject to change without notice prior to the contract being signed.</p>
                
                <div className="print:break-inside-avoid bg-slate-50 print:bg-transparent print:border print:border-slate-300 p-6 rounded-lg mb-8">
                  <p className="font-bold text-slate-900 print:text-black mb-2">Incentives & Discounts:</p>
                  <ul className="mb-6 text-slate-700 print:text-black list-none space-y-1">
                    <li>- 25 Year Longi Module Warranty (Parts & Labor)</li>
                    <li>- 10 Year Inverter Warranty (Parts & Labor)</li>
                    {estimate.discount > 0 && <li className="font-bold text-green-700 print:text-black">- Discount Applied: {fmt.format(estimate.discount)}</li>}
                  </ul>

                  <div className="w-full md:w-2/3 ml-auto text-base">
                    <div className="flex justify-between py-2 border-b border-slate-200 print:border-slate-300">
                      <span className="text-slate-600 print:text-slate-800">Sub-Total:</span> 
                      <span className="font-bold text-slate-900 print:text-black">{fmt.format(estimate.subTotal)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 print:border-slate-300">
                      <span className="text-slate-600 print:text-slate-800">Tax:</span> 
                      <span className="font-bold text-slate-900 print:text-black">{fmt.format(tax)}</span>
                    </div>
                    <div className="flex justify-between py-3 font-black text-lg text-slate-900 print:text-black mt-2 bg-slate-100 print:bg-transparent px-4 -mx-4 rounded">
                      <span>Total Price:</span> 
                      <span>{fmt.format(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border border-slate-300 print:border-black p-6 rounded-lg print:break-inside-avoid">
                  <div>
                    <h4 className="font-bold border-b border-slate-300 print:border-black pb-2 mb-4 text-slate-900 print:text-black">Payment Schedule (no financing)</h4>
                    <p className="mb-4 text-slate-700 print:text-black">We require Progress Payments as follows:</p>
                    <div className="space-y-4 text-slate-700 print:text-black">
                      <div>
                        <p className="font-bold text-slate-900 print:text-black">15% Deposit: {fmt.format(deposit)}</p>
                        <p className="text-xs">Payment due upon signing of this agreement</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 print:text-black">40% Progress Payment: {fmt.format(progressPayment)}</p>
                        <p className="text-xs">Payment due at time of Material Order</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 print:text-black">45% Final Payment: {fmt.format(finalPayment)}</p>
                        <p className="text-xs">Payment due upon physical completion, when all equipment is installed.</p>
                      </div>
                      <div className="pt-6 mt-6 border-t border-slate-300 print:border-black">
                        <p className="font-bold text-slate-900 print:text-black text-xs">Initial Here to Opt-In to Payment Schedule:</p>
                        <div className="h-8 border-b border-slate-400 w-32 mt-4"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:border-l md:border-slate-300 print:border-black md:pl-8">
                    <h4 className="font-bold border-b border-slate-300 print:border-black pb-2 mb-4 text-slate-900 print:text-black">Financing Option = 2.99% Fee</h4>
                    <div className="space-y-4 text-slate-700 print:text-black">
                      <div>
                        <p className="font-bold text-slate-900 print:text-black">17.99% Security Deposit: {fmt.format(securityDeposit)}</p>
                        <p className="text-xs">Due upon signing of this agreement.</p>
                      </div>
                      <p className="text-xs leading-relaxed">Security deposits are fully refundable upon job completion and final financing payment. Less the 2.99% financing fee.</p>
                      <p className="text-xs leading-relaxed">Financing Terms will be set out in a separate financing agreement, at which time customers will be given the option to Opt-Out of Financing.</p>
                      <div className="pt-6 mt-6 border-t border-slate-300 print:border-black">
                        <p className="font-bold text-slate-900 print:text-black text-xs">Initial Here to Opt-In to Financing:</p>
                        <div className="h-8 border-b border-slate-400 w-32 mt-4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="print:break-before-page pt-4">
                <h3 className="font-bold border-b border-slate-300 print:border-black mb-4 text-slate-900 print:text-black text-lg uppercase tracking-wide">Confirmation of Contract</h3>
                <div className="space-y-4 text-slate-700 print:text-black text-xs md:text-sm text-justify">
                  <p>On signature by all the parties this Confidential Proposal constitutes a binding contract and records the entire understanding. The company entering into this contract is Stardust Solar and will be bound by all the terms and conditions set out in this document. The person(s) signing as customer confirms that he/she is a registered owner(s) of the property or is authorized to sign the contract and bind the owner. No other understanding, collateral or otherwise, shall be binding unless agreed in writing and signed by all parties. Receipt of a copy of this contract is hereby acknowledged. All contracts are subject to a site assessment and verification of the feasibility of the scope of work by Stardust Solar. Additional terms and conditions are attached.</p>
                  
                  <p>The parties agree to indemnify and defend the other party and its directors, officers, employees, agents, representatives, and affiliates and hold them harmless from and against any and all losses, liabilities, damages, claims, suits, actions, judgments, assessments, costs and expenses, including without limitation interest, penalties, attorney fees, any and all expenses incurred in investigating, preparing, or defending against any litigation, commenced or threatened, or any claim whatsoever, and any and all amounts paid in settlement of any claim or litigation asserted against, imposed on, or incurred or suffered by any of them, directly or indirectly, as a result of or arising from the negligent or wrongful acts or omissions of the other party, from any breach of this agreement by the other party, or from any finding, judgment or other determination or settlement whereby the customer is deemed or considered to be the employer of contractor or of contractor's personnel.</p>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-x-12 gap-y-10 print:break-inside-avoid">
                  <div>
                    <p className="font-bold text-slate-900 print:text-black border-b border-slate-300 print:border-black pb-1 mb-1">{customer.name || ' '}</p>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">Customer Name</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 print:text-black border-b border-slate-300 print:border-black pb-1 mb-1">Mason Greene</p>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">Company Representative Name</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 print:text-black border-b border-slate-300 print:border-black pb-1 mb-1">{customer.email || ' '}</p>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">Customer Email Address</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 print:text-black border-b border-slate-300 print:border-black pb-1 mb-1">Stardust Solar Temiskaming</p>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">of; Company Name</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 print:text-black border-b border-slate-300 print:border-black pb-1 mb-1">{customer.phone || ' '}</p>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">Customer Phone Number</p>
                  </div>
                  <div></div> {/* Spacer */}
                  
                  <div className="pt-6">
                    <div className="h-10 border-b border-slate-400 print:border-black mb-1"></div>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">Customer Signature</p>
                  </div>
                  <div className="pt-6">
                    <div className="h-10 border-b border-slate-400 print:border-black mb-1"></div>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">Company Representative Signature</p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-slate-900 print:text-black border-b border-slate-300 print:border-black pb-1 mb-1">{currentDate}</p>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">Date</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 print:text-black border-b border-slate-300 print:border-black pb-1 mb-1">{currentDate}</p>
                    <p className="text-[10px] uppercase text-slate-500 print:text-slate-700 font-bold">Date</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      {/* MOBILE NAV: Stay Dark / Glass Effect (Hidden on Print) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full flex items-center p-2 shadow-2xl z-[100] print:hidden">
        <button 
          onClick={() => setMobileTab('setup')}
          className={`flex-1 h-full rounded-full font-black text-xs uppercase tracking-widest transition-all ${mobileTab === 'setup' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          Setup
        </button>
        <button 
          onClick={() => setMobileTab('preview')}
          className={`flex-1 h-full rounded-full font-black text-xs uppercase tracking-widest transition-all ${mobileTab === 'preview' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
        >
          View Doc
        </button>
      </div>
    </div>
  )
}