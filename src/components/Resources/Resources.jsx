export default function Resources() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-black text-blue-900 mb-2">Resource Library</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        <a href="#" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:shadow-md transition group">
          <span className="text-4xl mb-4 group-hover:scale-110 transition block">📄</span>
          <h4 className="font-black text-blue-900 text-sm">Client Contract</h4>
        </a>
      </div>
    </div>
  )
}
