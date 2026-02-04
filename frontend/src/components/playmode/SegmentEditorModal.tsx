import { useState, useEffect } from "react"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Button } from "../button"
import { WheelSegment } from "./CustomWheel"
import { PunishmentTypeInfo } from "../../helpers/context/playModeContext"
import { ModalWrapper } from "./shared"
import { PRESET_COLORS } from "./utils/rouletteUtils"

interface SegmentEditorModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  segments: WheelSegment[]
  onSave: (segments: WheelSegment[]) => void
  punishmentTypes?: PunishmentTypeInfo[]
}

export const SegmentEditorModal = ({ open, setOpen, segments, onSave, punishmentTypes = [] }: SegmentEditorModalProps) => {
  const [editingSegments, setEditingSegments] = useState<WheelSegment[]>(segments)

  useEffect(() => {
    if (open) {
      const convertedSegments = segments.map((seg) => {
        if (seg.punishmentTypeName && !seg.punishmentTypeId) {
          const pt = punishmentTypes.find((p) => p.name.toLowerCase() === seg.punishmentTypeName?.toLowerCase())
          if (pt) return { ...seg, punishmentTypeId: pt.punishment_type_id }
        }
        return seg
      })
      setEditingSegments(convertedSegments)
    }
  }, [open, segments, punishmentTypes])

  const updateSegment = (index: number, updates: Partial<WheelSegment>) => {
    setEditingSegments((prev) => prev.map((seg, i) => i === index ? { ...seg, ...updates, style: { ...seg.style, ...(updates.style || {}) } } : seg))
  }

  const updateSegmentWithLabel = (index: number, punishmentTypeId: string | undefined, amount: number) => {
    const pt = punishmentTypes.find((p) => p.punishment_type_id === punishmentTypeId)
    updateSegment(index, { punishmentTypeId, punishmentAmount: amount, option: amount === 0 ? "Ingen!" : pt ? `${amount} ${pt.name}` : `${amount} straff` })
  }

  const addSegment = () => {
    const defaultType = punishmentTypes[0]
    setEditingSegments((prev) => [...prev, {
      option: defaultType ? `1 ${defaultType.name}` : "1 straff",
      style: { backgroundColor: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)], textColor: "white" },
      punishmentAmount: 1,
      punishmentTypeId: defaultType?.punishment_type_id,
    }])
  }

  const addFreeSegment = () => {
    setEditingSegments((prev) => [...prev, { option: "Ingen!", style: { backgroundColor: "#22c55e", textColor: "white" }, punishmentAmount: 0 }])
  }

  const removeSegment = (index: number) => {
    if (editingSegments.length <= 2) return
    setEditingSegments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => { onSave(editingSegments); setOpen(false) }
  const handleClose = () => { setEditingSegments(segments); setOpen(false) }

  return (
    <ModalWrapper open={open} onClose={handleClose} title="Rediger hjulet">
      <div className="p-6 pt-4">
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {editingSegments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3">
              <input type="color" value={segment.style.backgroundColor} onChange={(e) => updateSegment(index, { style: { ...segment.style, backgroundColor: e.target.value } })} className="h-8 w-8 cursor-pointer rounded border-0 p-0" />
              {punishmentTypes.length > 0 ? (
                <select
                  value={segment.punishmentTypeId || "none"}
                  onChange={(e) => updateSegmentWithLabel(index, e.target.value === "none" ? undefined : e.target.value, e.target.value === "none" ? 0 : segment.punishmentAmount || 1)}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="none">Ingen straff</option>
                  {punishmentTypes.map((pt) => <option key={pt.punishment_type_id} value={pt.punishment_type_id}>{pt.name} {pt.emoji}</option>)}
                </select>
              ) : (
                <input type="text" value={segment.option} onChange={(e) => updateSegment(index, { option: e.target.value })} className="flex-1 rounded-md border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Tekst" />
              )}
              {(segment.punishmentTypeId || punishmentTypes.length === 0) && segment.punishmentAmount !== 0 && (
                <input type="number" min={1} max={10} value={segment.punishmentAmount} onChange={(e) => punishmentTypes.length > 0 && segment.punishmentTypeId ? updateSegmentWithLabel(index, segment.punishmentTypeId, parseInt(e.target.value) || 1) : updateSegment(index, { punishmentAmount: parseInt(e.target.value) || 1 })} className="w-14 rounded-md border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 px-2 py-1 text-center text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              )}
              <button onClick={() => removeSegment(index)} disabled={editingSegments.length <= 2} className="rounded p-1 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"><TrashIcon className="h-4 w-4" /></button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={addSegment} className="flex flex-1 items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 py-2 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500"><PlusIcon className="h-4 w-4" />Straff</button>
          <button onClick={addFreeSegment} className="flex flex-1 items-center justify-center gap-1 rounded-lg border-2 border-dashed border-green-300 dark:border-green-600 py-2 text-sm text-green-500 dark:text-green-400 hover:border-green-400 hover:text-green-600"><PlusIcon className="h-4 w-4" />Ingen straff</button>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Bruk fargeskjema:</p>
          <div className="flex flex-wrap gap-1">
            {PRESET_COLORS.slice(0, 5).map((color, colorIndex) => (
              <button key={color} onClick={() => setEditingSegments((prev) => prev.map((seg, i) => ({ ...seg, style: { ...seg.style, backgroundColor: PRESET_COLORS[(i + colorIndex) % PRESET_COLORS.length] } })))} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-700 shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="OUTLINE" onClick={handleClose}>Avbryt</Button>
          <Button onClick={handleSave}>Lagre</Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
