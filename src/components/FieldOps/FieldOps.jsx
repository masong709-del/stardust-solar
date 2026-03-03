export default function FieldOps() {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-8">Field Operations Protocol</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <span className="text-2xl">📷</span>
            <h3 className="font-black text-xl text-blue-900">Site Survey Photos</h3>
          </div>
          <div className="space-y-4">
            {[
              { title: '1. Electrical Service', items: ['Main Panel: Clear photo of all breakers.', 'Panel Labels: Photo of the panel index.', 'Meter & Mast: Wide shot showing clearance.'] },
              { title: '2. Structural', items: ['Attic Access: Rafter spacing and size.', 'Roof Condition: Close-up of shingles.'] },
            ].map((group) => (
              <div key={group.title} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-black text-xs uppercase text-blue-900 tracking-wider mb-2">{group.title}</h4>
                {group.items.map((item) => (
                  <label key={item} className="flex items-start gap-3 text-sm text-slate-700 mb-2 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-900" />
                    <span dangerouslySetInnerHTML={{ __html: item.replace(/^([^:]+):/, '<b>$1:</b>') }} />
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 text-9xl">⚠️</div>
          <div className="relative z-10">
            <h3 className="font-black text-2xl text-yellow-400 mb-2">Hydro One Protocol</h3>
            <p className="text-sm text-slate-300 mb-4">Handling connection upgrade fees.</p>
            <ol className="space-y-4 text-sm text-slate-300">
              {[
                { step: 1, title: 'Speed is Trust.', body: 'Call the client immediately.' },
                { step: 2, title: 'Pass-Through Cost.', body: 'We do not mark up utility fees.' },
                { step: 3, title: 'Frame the Value.', body: 'It increases grid capacity.' },
                { step: 4, title: 'Pivot to Financing.', body: 'Fold this into their package.' },
              ].map(({ step, title, body }) => (
                <li key={step} className="flex gap-3">
                  <span className="bg-yellow-400 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center font-black shrink-0">{step}</span>
                  <div><b className="text-white block">{title}</b>{body}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
