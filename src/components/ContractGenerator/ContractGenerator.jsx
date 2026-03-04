import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'

export default function ContractGenerator() {
  const { customerForContract, estimateForContract } = useAppStore()

  // Customer Form State
  const [customer, setCustomer] = useState({
    name: '', address: '', city: '', postal: '', phone: '', email: ''
  })

  // We keep the estimate in local state so we can override it via the dropdown
  const [estimate, setEstimate] = useState(estimateForContract || {
    kw: 0, mountType: "Roof", sysType: "Grid-Tied", panel: "TBD", inverter: "TBD", batteryKwh: 0, subTotal: 0, discount: 0
  })

  // List of all saved estimates for the dropdown
  const [savedEstimatesList, setSavedEstimatesList] = useState([])

  useEffect(() => {
    // Populate customer if routed from tracker
    if (customerForContract) {
      setCustomer({
        name: customerForContract.name || '',
        address: customerForContract.address || '',
        city: customerForContract.city || '',
        postal: customerForContract.postal || '',
        phone: customerForContract.phone || '',
        email: customerForContract.email || ''
      })
    }
    // Pull saved estimates into the dropdown list
    setSavedEstimatesList(JSON.parse(localStorage.getItem('stardustEstimates') || '[]'))
  }, [customerForContract])

  // Allows user to pull an old estimate directly into the contract
  const handleSelectEstimate = (e) => {
    const estId = parseInt(e.target.value)
    if (!estId) return
    const est = savedEstimatesList.find(x => x.id === estId)
    if (est) {
      setEstimate(est)
    }
  }

  // Math
  const taxRate = 0.13
  const tax = estimate.subTotal * taxRate
  const total = estimate.subTotal + tax

  const deposit = total * 0.15
  const progressPayment = total * 0.40
  const finalPayment = total * 0.45
  const securityDeposit = total * 0.1799

  const handlePrint = () => window.print()
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <section className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-end mb-8 print:hidden">
        <div>
          <h2 className="text-4xl font-black text-blue-900 mb-2">Contract Generator</h2>
          {estimate.subTotal === 0 && (
             <p className="text-orange-500 font-bold text-sm bg-orange-100 px-3 py-1 rounded inline-block">
               ⚠️ Warning: No active estimate loaded. Select one below or build a new quote.
             </p>
          )}
        </div>
        <button onClick={handlePrint} className="bg-blue-900 text-white px-6 py-3 rounded-xl font-black shadow-lg hover:bg-blue-800 transition">
          <i className="fas fa-print mr-2"></i> Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          
          {/* NEW: Estimate Selector */}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-800 relative border-t-4 border-yellow-400">
            <h3 className="font-black text-yellow-400 mb-4 text-sm uppercase tracking-widest">
              <i className="fas fa-file-invoice-dollar mr-2"></i>Attach Saved Estimate
            </h3>
            <select onChange={handleSelectEstimate} className="w-full p-3 border border-slate-700 rounded-xl bg-slate-800 text-white font-bold outline-none focus:border-yellow-400 transition">
              <option value="">-- Search & Select Estimate --</option>
              {savedEstimatesList.slice().reverse().map(est => (
                <option key={est.id} value={est.id}>{est.name} ({est.date}) - {fmt.format(est.subTotal)}</option>
              ))}
            </select>
          </div>

          {/* Customer Form */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-black text-xl text-blue-900 mb-6 border-b border-slate-100 pb-4">
              <i className="fas fa-address-book mr-2"></i>Customer Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-black text-slate-500 mb-2">Full Name</label>
                <input type="text" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition" />
              </div>
              <div>
                <label className="block text-xs uppercase font-black text-slate-500 mb-2">Street Address</label>
                <input type="text" value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-black text-slate-500 mb-2">City/Prov</label>
                  <input type="text" value={customer.city} onChange={(e) => setCustomer({...customer, city: e.target.value})} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition" />
                </div>
                <div>
                  <label className="block text-xs uppercase font-black text-slate-500 mb-2">Postal</label>
                  <input type="text" value={customer.postal} onChange={(e) => setCustomer({...customer, postal: e.target.value})} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-black text-slate-500 mb-2">Email</label>
                <input type="email" value={customer.email} onChange={(e) => setCustomer({...customer, email: e.target.value})} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition" />
              </div>
              <div>
                <label className="block text-xs uppercase font-black text-slate-500 mb-2">Phone</label>
                <input type="tel" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-blue-900 font-bold outline-none focus:border-yellow-400 transition" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Document Preview */}
        <div className="lg:col-span-8 bg-white p-12 rounded-sm shadow-2xl border border-slate-200 text-slate-800 font-serif text-sm leading-relaxed print:p-0 print:shadow-none print:border-none print:text-black">
          
          <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-widest mb-4">Solar Installation Agreement</h1>
              <div className="space-y-1 font-medium">
                <p className="font-bold text-lg">{customer.name || 'Client Name'}</p>
                <p>{customer.address || 'Street Address'}</p>
                <p>{customer.city || 'City, Province'} {customer.postal}</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p><strong>Date:</strong> {currentDate}</p>
              <p><strong>Offer Valid For:</strong> 30-Days</p>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs">
                <p className="font-bold text-sm">Prepared By:</p>
                <p>Mason Greene</p>
                <p>Mason.greene@stardustsolar.com</p>
                <p>622-0687</p>
                <p className="font-bold italic">Stardust Solar Temiskaming</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold border-b border-slate-300 mb-3 uppercase tracking-wider">Scope of Work</h2>
            <div className="space-y-2">
              <p><strong>Your Solar PV System:</strong> We will determine and confirm the optimum location for your solar panels on the property.</p>
              <p><strong>Solar Panel System:</strong> {estimate.mountType} Mounted {estimate.kw}kW Solar(PV) {estimate.sysType} System {estimate.batteryKwh > 0 ? `with ${estimate.batteryKwh.toFixed(1)} kWh storage capacity.` : ''}</p>
              <p><strong>Solar Panel Details:</strong> {estimate.panel} & {estimate.inverter} (or equivalent, solar panel power rating may vary by up to 2.5%).</p>
              <p>Our systems include web monitoring devices and setup so that the system owner can see how much the system is generating over time and at any given time.</p>
              <p>Our systems include equipment, wiring, and devices necessary to make a functioning system complete.</p>
              <p>Our systems include planning, design, permitting, installation, labor, system connection, set-up, and testing.</p>
            </div>
          </div>

          <div className="mb-6 space-y-4 text-[13px] text-justify">
            <h2 className="text-lg font-bold border-b border-slate-300 mb-3 uppercase tracking-wider">Notes</h2>
            <p><strong>Confidentiality:</strong> This Confidential Proposal has been proposed exclusively for you. This remains the property of Stardust Solar until accepted and may not be given to or shown to any other person or company.</p>
            <p><strong>Warranty:</strong> All Stardust Solar crews working on your roof and your electrical system are certified. We are so confident in our work that we offer you a 5-Year Workmanship Warranty on our labor, in addition to the manufacturer’s warranties on the equipment installed. As well, we offer a 5-Year Roof Warranty along with your solar and workmanship warranties, pending a roofing inspection. This covers you for any leaks as a result of our work on your solar roof faces.</p>
            <p><strong>Insurance:</strong> Our company carries a minimum of $5 million in commercial liability and ensures workers are registered in accordance with local occupational health and safety and workers compensation requirements. It is the responsibility of the customer to ensure that they carry comprehensive liability cover in excess of $5 million if they so require.</p>
            <p><strong>Debris Removal:</strong> It is our goal to remove all debris and leave premises in clean condition without damage to the surrounding property, and to restore any landscaping to its original condition.</p>
            <p><strong>Access to Property:</strong> This agreement is based on the assumption that we, along with necessary associates and inspectors, will have free access to the property, electrical panel, and wiring routes during regular business hours. Notice and request for access will be given and confirmed by the customer.</p>
            <p><strong>Incentive and Financing:</strong> We will provide support to help customers navigate government incentives programs and financing options. Approvals and costs of government incentive and financing approvals are the responsibility of the customer, and any financing terms will be set out in a separate financing agreement between the customer and finance company.</p>
            <p><strong>Project Timing:</strong> Due to the uncertainty of weather conditions, material supplies, and shipping delays it is not possible to give an exact start date or completion date, however our projects are as a rule completed on a ‘first come first serve basis’, and we will always do our best to get to your project in a timely manner. However, due to such variables, any start date given whether verbal or written are to be considered tentative and cannot be guaranteed.</p>
            <p><strong>Work Quality:</strong> Our work will be completed in a quality manner and in compliance with all building and electrical codes, all other applicable laws, and all applicable utility requirements, including appropriate utility interconnection obligations.</p>
            <p><strong>Change Orders:</strong> Due to possible unforeseen circumstances such as physical obstacles to solar panel locations, problems with the existing electrical system, or late progress payments causing delays and material price changes, we may need to make changes to the scope of work or adjustments to the price or payment structure. All change orders will be provided to customers for approval before proceeding.</p>
            <p><strong>Payment Schedule:</strong> We require progress payments at certain stages of the project in order to proceed. See Pricing Summary for progress payments terms and amounts. Failure to make progress payments or approve financing payments may result in stop-work, stop-progress orders, project delays, and/or additional costs.</p>
            <p><strong>Cancellation:</strong> The customer may cancel the installation during any stage of the project. If the customer cancels prior to the installation start-date, any deposits and progress payments are fully refundable, less any permit fees or other expenses incurred, and a 25% restocking fee on any solar equipment & materials purchased. If the customer cancels after the physical installation has begun, no refunds will be available. Security deposits for financing customers will be financing customers will be fully refundable on completion of the job, less any remaining balance owing.</p>
          </div>

          <div className="break-before-page"></div>

          <div className="mb-6 pt-6">
            <h2 className="text-lg font-bold border-b border-slate-300 mb-4 uppercase tracking-wider">Pricing Summary</h2>
            <p className="mb-4">The following is a summary of pricing for this proposal, subject to the validity period, and otherwise subject to change without notice prior to the contract being signed.</p>
            
            <div className="bg-slate-50 p-6 border border-slate-200">
              <p className="font-bold mb-2">Incentives & Discounts:</p>
              <ul className="mb-4 space-y-1 ml-4 list-disc">
                <li>25 Year Longi Module Warranty (Parts & Labor)</li>
                {estimate.batteryKwh > 0 && <li>10 Year EG4 Warranty (Part & Labour)</li>}
                <li>Discount: {fmt.format(estimate.discount)}</li>
              </ul>
              <div className="flex justify-end mt-6">
                <div className="w-1/2 space-y-2 text-base">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span>Sub-Total:</span>
                    <span className="font-bold">{fmt.format(estimate.subTotal)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span>Tax (13%):</span>
                    <span>{fmt.format(tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl pt-2">
                    <span className="font-bold">Total Price:</span>
                    <span className="font-black">{fmt.format(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold border-b border-slate-300 mb-4 uppercase tracking-wider">Payment Schedule (No Financing)</h2>
            <p className="mb-2">We require Progress Payments as follows:</p>
            <table className="w-full text-sm text-left border-collapse mb-4">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold w-1/4">15% Deposit:</td>
                  <td className="py-2 font-black w-1/4">{fmt.format(deposit)}</td>
                  <td className="py-2 text-slate-600">Payment due upon signing of this agreement</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold">40% Progress:</td>
                  <td className="py-2 font-black">{fmt.format(progressPayment)}</td>
                  <td className="py-2 text-slate-600">Payment due at time of Material Order</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold">45% Final:</td>
                  <td className="py-2 font-black">{fmt.format(finalPayment)}</td>
                  <td className="py-2 text-slate-600">Payment due upon physical completion, when all equipment is installed.</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 italic">._______________________________________ Initial Here to Opt-In to Payment Schedule</p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold border-b border-slate-300 mb-4 uppercase tracking-wider">Financing Option = 2.99% Fee</h2>
            <p className="mb-2">We require Progress Payments as follows:</p>
            <table className="w-full text-sm text-left border-collapse mb-4">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-bold w-1/4">17.99% Security Deposit:</td>
                  <td className="py-2 font-black w-1/4">{fmt.format(securityDeposit)}</td>
                  <td className="py-2 text-slate-600">Due upon signing of this agreement.</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-slate-600 mb-2">Security deposits are fully refundable upon job completion and final financing payment. Less the 2.99% financing fee.</p>
            <p className="text-xs text-slate-600 mb-4">Financing Terms will be set out in a separate financing agreement, at which time customers will be given the option to Opt-Out of Financing.</p>
            <p className="mt-4 italic">._______________________________________ Initial Here to Opt-In to Financing</p>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-slate-800 text-[12px] text-justify space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-2">Confirmation of Contract</h2>
            <p>On signature by all the parties this Confidential Proposal constitutes a binding contract and records the entire understanding. The company entering into this contract is Stardust Solar and will be bound by all the terms and conditions set out in this document. The person(s) signing as customer confirms that he/she is a registered owner(s) of the property or is authorized to sign the contract and bind the owner. No other understanding, collateral or otherwise, shall be binding unless agreed in writing and signed by all parties. Receipt of a copy of this contract is hereby acknowledged. All contracts are subject to a site assessment and verification of the feasibility of the scope of work by Stardust Solar. Additional terms and conditions are attached.</p>
            <p>The parties agree to indemnify and defend the other party and its directors, officers, employees, agents, representatives, and affiliates and hold them harmless from and against any and all losses, liabilities, damages, claims, suits, actions, judgments, assessments, costs and expenses, including without limitation interest, penalties, attorney fees, any and all expenses incurred in investigating, preparing, or defending against any litigation, commenced or threatened, or any claim whatsoever, and any and all amounts paid in settlement of any claim or litigation asserted against, imposed on, or incurred or suffered by any of them, directly or indirectly, as a result of or arising from the negligent or wrongful acts or omissions of the other party, from any breach of this agreement by the other party, or from any finding, judgment or other determination or settlement whereby the customer is deemed or considered to be the employer of contractor or of contractor's personnel.</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-12">
            <div>
              <div className="border-b border-black h-8 mb-2"></div>
              <p className="text-xs font-bold uppercase">Customer Signature</p>
              <p className="text-sm mt-2">{customer.name}</p>
              <p className="text-sm">{customer.email}</p>
              <p className="text-sm">{customer.phone}</p>
              <div className="border-b border-black h-8 mt-6 mb-2 w-1/2"></div>
              <p className="text-xs font-bold uppercase">Date</p>
            </div>
            <div>
              <div className="border-b border-black h-8 mb-2"></div>
              <p className="text-xs font-bold uppercase">Company Representative</p>
              <p className="text-sm mt-2">Mason Greene</p>
              <p className="text-sm">of; Stardust Solar Temiskaming</p>
              <div className="border-b border-black h-8 mt-11 mb-2 w-1/2"></div>
              <p className="text-xs font-bold uppercase">Date</p>
            </div>
          </div>

          <div className="mt-12 break-inside-avoid">
            <h2 className="text-lg font-bold border-b border-slate-300 mb-4 uppercase tracking-wider">Additional Notes</h2>
            <div className="space-y-8 mt-8">
              <div className="border-b border-slate-400 w-full"></div>
              <div className="border-b border-slate-400 w-full"></div>
              <div className="border-b border-slate-400 w-full"></div>
              <div className="border-b border-slate-400 w-full"></div>
              <div className="border-b border-slate-400 w-full"></div>
              <div className="border-b border-slate-400 w-full"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}