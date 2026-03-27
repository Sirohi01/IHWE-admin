import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Table({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  wrapperClassName = ""
}) {
  const showActions = onEdit || onDelete;

  return (
    <div className="w-full overflow-hidden">

      {/* Always scrollable horizontally */}
      <div className={`table-scroll-wrapper rounded-md border border-gray-100 bg-white shadow-md ${wrapperClassName}`}>
        <table className="w-full text-sm whitespace-nowrap">

          {/* HEADER */}
          <thead className="bg-black">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={`${col.key}-${index}`}
                  className={`px-6 py-4 font-bold text-white uppercase text-xs ${col.headerClassName || 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-4 text-right font-bold text-white uppercase text-xs">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="text-center py-12 text-gray-400"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-blue-50 transition">
                  {columns.map((col, colIndex) => (
                    <td key={`${col.key}-${colIndex}`} className={`px-6 py-4 ${col.className || ''}`}>
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}