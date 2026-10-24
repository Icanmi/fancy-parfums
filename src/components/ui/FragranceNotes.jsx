import { FiClock, FiWind, FiLayers } from 'react-icons/fi'

export default function FragranceNotes({ notes, longevity, sillage, concentration, fragranceFamily }) {
  return (
    <div className="space-y-6">
      {/* Overview chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#FBF8EF] rounded-sm border border-[#D4AF37]/20 text-xs">
        <div>
          <span className="text-gray-500 block uppercase tracking-wider text-[10px]">Family</span>
          <span className="font-bold text-[#0A0A0A]">{fragranceFamily || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500 block uppercase tracking-wider text-[10px]">Concentration</span>
          <span className="font-bold text-[#0A0A0A]">{concentration || 'Eau de Parfum'}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-gray-500 block uppercase tracking-wider text-[10px]">Longevity</span>
          <span className="font-bold text-[#0A0A0A] flex items-center gap-1">
            <FiClock size={12} className="text-[#D4AF37]" /> {longevity || '8-10 Hours'}
          </span>
        </div>
      </div>

      {/* Pyramid */}
      {notes && (
        <div className="border border-gray-200 rounded-sm p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center gap-2">
            <FiLayers className="text-[#D4AF37]" /> Olfactory Pyramid
          </h4>

          {/* Top */}
          {notes.top?.length > 0 && (
            <div className="border-l-2 border-[#D4AF37] pl-3 py-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Top Notes (Opening — First 15 Mins)
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {notes.top.map((note) => (
                  <span
                    key={note}
                    className="px-2.5 py-1 bg-[#FBF8EF] border border-gray-200 text-xs font-medium text-[#0A0A0A] rounded-full"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Middle */}
          {notes.middle?.length > 0 && (
            <div className="border-l-2 border-[#0A0A0A] pl-3 py-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Heart / Middle Notes (The Core Identity)
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {notes.middle.map((note) => (
                  <span
                    key={note}
                    className="px-2.5 py-1 bg-white border border-gray-300 text-xs font-medium text-[#0A0A0A] rounded-full shadow-sm"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Base */}
          {notes.base?.length > 0 && (
            <div className="border-l-2 border-[#D4AF37] pl-3 py-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Base Notes (The Lingering Drydown)
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {notes.base.map((note) => (
                  <span
                    key={note}
                    className="px-2.5 py-1 bg-[#0A0A0A] text-[#D4AF37] text-xs font-medium rounded-full"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sillage meter */}
      {sillage && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm text-xs">
          <span className="text-gray-600 flex items-center gap-1.5 font-medium">
            <FiWind className="text-[#D4AF37]" size={14} /> Sillage & Projection
          </span>
          <span className="font-bold text-[#0A0A0A] uppercase tracking-wider">{sillage}</span>
        </div>
      )}
    </div>
  )
}
