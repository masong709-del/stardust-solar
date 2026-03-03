export const techModules = [
  {
    id: 'value_prop',
    title: '1. The Value Proposition',
    content: (
      <div>
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Why Do Homeowners Go Solar?</h3>
        <p className="text-slate-600 mb-4">Solar isn't just about saving the environment; it's a financial hedge against inflation. In Ontario, utility rates climb. By installing solar, homeowners replace an unpredictable utility bill with a fixed payment.</p>
        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
          <p className="font-bold text-blue-900 mb-2">The Core Pitch:</p>
          <p className="italic text-slate-700">"You are renting your power right now at a premium. Solar allows you to own your personal power plant for $0 down, locking in your rate."</p>
        </div>
      </div>
    ),
    quiz: {
      q: 'How do you explain solar to a homeowner in one sentence?',
      options: [
        "It adds a new monthly bill to save the environment.",
        "It replaces a rising, unpredictable utility expense with a fixed, lower payment.",
        "It eliminates all electricity costs immediately.",
        "It requires a large upfront investment to see long-term savings.",
      ],
      correct: 1,
    },
  },
  {
    id: 'hardware',
    title: '2. The Hardware',
    content: (
      <div>
        <h3 className="text-2xl font-bold text-blue-900 mb-2">Core System Components</h3>
        <p className="text-slate-500 mb-6 italic">Hover over the cards to see how the energy flows from the roof to the grid.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '☀️', label: 'Solar Panels', back: 'The Generators', desc: 'Captures photons to generate DC power. We use Tier-1 Monocrystalline panels.' },
            { icon: '🖥️', label: 'Inverter', back: 'The Brains', desc: 'Converts raw DC power from the panels into usable AC power for your home.' },
            { icon: '⚡', label: 'Bi-Directional Meter', back: 'The Accountant', desc: 'Spins forward when pulling grid power, and backward when sending excess out.' },
            { icon: '🔋', label: 'Battery (Optional)', back: 'The Vault', desc: 'Stores excess DC solar power for nighttime use and backup power.' },
          ].map((c) => (
            <div key={c.label} className="hover-flip-card h-56">
              <div className="flip-card-inner">
                <div className="card-face card-front flex-col">
                  <span className="text-4xl mb-2">{c.icon}</span>
                  <span className="text-sm">{c.label}</span>
                </div>
                <div className="card-face card-back text-xs text-left p-4">
                  <p className="font-bold text-yellow-400 mb-1">{c.back}</p>
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    quiz: {
      q: "A homeowner asks: 'What does the inverter actually do?' What's the correct answer?",
      options: [
        "It stores solar power for use at night.",
        "It tracks how much power you send back to the grid.",
        "It converts DC power from the panels into usable AC power for the home.",
        "It generates DC power directly from sunlight.",
      ],
      correct: 2,
    },
  },
  {
    id: 'pv_effect',
    title: '3. The PV Effect',
    content: (
      <div>
        <h3 className="text-2xl font-bold text-blue-900 mb-4">How Do Panels Actually Make Power?</h3>
        <p className="text-slate-600 mb-4">It's called the Photovoltaic (PV) Effect. When sunlight hits the solar panels, it excites electrons in the silicon cells...</p>
        <div className="mt-4 p-6 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center w-full shadow-inner">
          <p className="text-slate-400 italic text-sm">[Image of photovoltaic cell structure]</p>
        </div>
      </div>
    ),
    quiz: {
      q: "A skeptic says 'It's cloudy here half the year.' What's the best response?",
      options: [
        "Solar only works in sunny climates, so you're right to be concerned.",
        "UV rays still penetrate clouds — Germany is a world solar leader with less sun than Ontario.",
        "Cloudy days produce zero power, but summer output compensates.",
        "You need a battery to make solar work in cloudy climates.",
      ],
      correct: 1,
    },
  },
  {
    id: 'net_metering',
    title: '4. Net Metering',
    content: (
      <div>
        <h3 className="text-2xl font-bold text-blue-900 mb-4">The Financial Engine of Solar</h3>
        <p className="text-slate-600 mb-4">Think of the provincial grid as an infinite, invisible battery. In the summer, your solar system will likely produce more power than your home uses...</p>
        <div className="mt-4 p-6 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center w-full shadow-inner">
          <img src="image_fc18fa.jpg" alt="Net Metering Diagram" className="w-full max-w-lg rounded-lg shadow-md mb-3 border border-slate-200" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Grid Integration & Credit Banking</p>
        </div>
      </div>
    ),
    quiz: {
      q: "Under Net Metering, what happens to excess solar power your home generates?",
      options: [
        "It is wasted and the system shuts down.",
        "It charges your on-site battery automatically.",
        "It is sent to the grid and credited against your future electricity bill.",
        "It is sold back to Hydro One at market rate as cash.",
      ],
      correct: 2,
    },
  },
]
