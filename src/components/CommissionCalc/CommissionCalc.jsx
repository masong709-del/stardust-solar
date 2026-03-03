import { useState } from 'react'

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-CA')

export default function CommissionCalc() {
  const [kw, setKw] = useState(8)
  const [ppw, setPpw] = useState(3.20)
  const [commRate, setCommRate] = useState(5)
  const [incentive, setIncentive] = useState(30)

  const systemCost = kw * 1000 * ppw
  const incentiveAmt = systemCost * incentive / 100
  const netCost = systemCost - incentiveAmt
  const commission = systemCost * commRate / 100

  const stats = [
    { label: 'System Cost', value: fmt(systemCost), cls: 'bg-slate-50 border-slate-100 text-blue-900' },
    { label: 'Federal Incentive', value: fmt(incentiveAmt), cls: 'bg-green-50 border-green-100 text-green-600' },
    { label: 'Net to Customer', value: fmt(netCost), cls: 'bg-blue-50 border-blue-100 text-blue-700' },
    { label: 'Your Commission', value: fmt(commission), cls: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-2">Commission Calculator</h2>
      <p className="text-slate-500 mb-8 italic">Know your numbers before you knock.</p>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-2 gap-6 mb-8">
          {[
            { label: 'System Size (kW)', value: kw, set: setKw, step: 1 },
            { label: 'Price per Watt ($)', value: ppw, set: setPpw, step: 0.01 },
            { label: 'Commission Rate (%)', value: commRate, set: setCommRate, step: 0.5 },
            { label: 'Federal Incentive (%)', value: incentive, set: setIncentive, step: 1 },
          ].map(({ label, value, set, step }) => (
            <div key={label}>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">{label}</label>
              <input
                type="number"
                value={value}
                step={step}
                onChange={(e) => set(parseFloat(e.target.value) || 0)}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-lg font-black text-blue-900 outline-none focus:border-yellow-400"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, cls }) => (
            <div key={label} className={`rounded-2xl p-4 text-center border ${cls}`}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">{label}</p>
              <p className="text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
