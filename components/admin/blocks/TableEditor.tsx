'use client'

import { TableBlockContent } from '@/lib/validators/blocks'

interface TableEditorProps {
  data: TableBlockContent
  onChange: (data: TableBlockContent) => void
}

export default function TableEditor({ data, onChange }: TableEditorProps) {
  const updateHeader = (i: number, value: string) => {
    const headers = [...data.headers]
    headers[i] = value
    onChange({ ...data, headers })
  }

  const updateCell = (r: number, c: number, value: string) => {
    const rows = data.rows.map((row) => [...row])
    rows[r][c] = value
    onChange({ ...data, rows })
  }

  const addColumn = () => {
    onChange({
      ...data,
      headers: [...data.headers, `Column ${data.headers.length + 1}`],
      rows: data.rows.map((row) => [...row, '']),
    })
  }

  const addRow = () => {
    onChange({ ...data, rows: [...data.rows, data.headers.map(() => '')] })
  }

  const removeRow = (r: number) => {
    onChange({ ...data, rows: data.rows.filter((_, i) => i !== r) })
  }

  const removeColumn = (c: number) => {
    onChange({
      ...data,
      headers: data.headers.filter((_, i) => i !== c),
      rows: data.rows.map((row) => row.filter((_, i) => i !== c)),
    })
  }

  return (
    <div className="space-y-2 overflow-x-auto">
      <input
        type="text"
        placeholder="Table caption (optional)…"
        value={data.caption || ''}
        onChange={(e) => onChange({ ...data, caption: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {data.headers.map((header, c) => (
              <th key={c} className="p-1 border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-1">
                  <input
                    value={header}
                    onChange={(e) => updateHeader(c, e.target.value)}
                    className="flex-1 min-w-0 bg-transparent font-semibold focus:outline-none text-gray-800 text-xs"
                    placeholder={`Header ${c + 1}`}
                  />
                  {data.headers.length > 1 && (
                    <button onClick={() => removeColumn(c)} className="text-gray-400 hover:text-red-500 text-xs">×</button>
                  )}
                </div>
              </th>
            ))}
            <th className="p-1 border border-gray-200 bg-gray-50 w-8">
              <button onClick={addColumn} className="text-blue-500 hover:text-blue-700 font-bold text-xs">+</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="p-1 border border-gray-200">
                  <input
                    value={cell}
                    onChange={(e) => updateCell(r, c, e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-gray-700 text-xs"
                    placeholder="—"
                  />
                </td>
              ))}
              <td className="p-1 border border-gray-200 text-center">
                <button onClick={() => removeRow(r)} className="text-gray-400 hover:text-red-500 text-xs">×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        + Add row
      </button>
    </div>
  )
}
