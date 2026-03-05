import { useState } from 'react'
import { Receipt } from 'lucide-react'

export default function CommissionCalc() {
  // Input State
  const [deals, setDeals] = useState(0)
  const [avgRev, setAvgRev] = useState(30000)

  // --- MATH & LOGIC ---
  const totalRev = deals * avgRev
  const commRate = deals >= 5 ? 0.05 : 0.03
  const baseComm = totalRev * commRate
  
  const payB3 = deals >= 3 ? 1000 : 0
  const payB7 = deals >= 7 ? 1500 : 0
  const total = baseComm + payB3 + payB7

  // --- FORMATTING ---
  const fmt = new Intl.NumberFormat('en-CA', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  })

  // --- DYNAMIC INSIGHT MESSAGE ---
  let insightMsg = null
  let insightClass = "bg-blue-900/50 border border-blue-800 text-blue-300"

  if (deals < 3) {
    insightMsg = <>Close <b className="text-white">{3 - deals} more deals</b> to unlock the $1,000 bonus.</>
  } else if (deals < 5) {
    insightMsg = <>Close <b className="text-white text-lg">{5 - deals} more deals</b> to unlock the 5% RETROACTIVE multiplier!</>
    insightClass = "bg-red-900/50 border border-red-800 text-red-300" // Red alert for the big jump
  } else if (deals < 7) {
    insightMsg = <>Close <b className="text-white">{7 - deals} more deals</b> to unlock the $1,500 bonus.</>
  } else {
    insightMsg = <>🔥 President's Club Unlocked. Maximum commissions applied!</>
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in-up">
      <h2 className="text-4xl font-black text-blue-900 mb-8">Commission & Bonus Calculator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
          <h3 className="font-black text-2xl text-blue-900 mb-6">Input Variables</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm uppercase font-bold text-slate-500 mb-2">
                Total Deals Closed
              </label>
              <input 
                type="number" 
                value={deals || ''} 
                onChange={(e) => setDeals(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-xl font-black text-blue-900 outline-none focus:border-yellow-400 transition-colors"
              />
              <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-wide uppercase">
                Calculate your projected end-of-month payout
              </p>
            </div>
            
            <div>
              <label className="block text-sm uppercase font-bold text-slate-500 mb-2">
                Avg System Revenue ($)
              </label>
              <input 
                type="number" 
                value={avgRev || ''} 
                onChange={(e) => setAvgRev(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-xl font-black text-blue-900 outline-none focus:border-yellow-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output */}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative border-t-4 border-green-500 flex flex-col justify-between transition-all duration-300">
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h3 className="font-black text-xl text-green-400 flex items-center gap-2">
                <Receipt size={24} /> Projected Payout
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Gross Pay
              </span>
            </div>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-slate-400">
                <span>Total Branch Revenue:</span> 
                <span className="text-slate-300">{fmt.format(totalRev)}</span>
              </div>
              <div className="flex justify-between text-slate-300 items-center">
                <span>Base Commission Rate:</span> 
                <span className={`transition-all duration-300 ${deals >= 5 ? 'font-black text-yellow-400 text-lg scale-110 origin-right' : 'font-bold text-white'}`}>
                  {(commRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Base Commission:</span> 
                <span className="font-bold text-white">{fmt.format(baseComm)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>3-Deal Bonus (Flat):</span> 
                <span className="font-bold text-green-400">{fmt.format(payB3)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>7-Deal Bonus (Flat):</span> 
                <span className="font-bold text-green-400">{fmt.format(payB7)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-600">
            <div className="flex justify-between items-end mb-4">
              <span className="text-xs uppercase tracking-widest font-bold text-slate-400">
                Total Month Projection
              </span>
              <span className="text-4xl font-black text-green-500 tracking-tighter transition-all duration-300">
                {fmt.format(total)}
              </span>
            </div>
            
            <div className={`p-3 rounded-lg text-xs text-center uppercase tracking-widest font-bold transition-all duration-500 ${insightClass}`}>
              {insightMsg}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}