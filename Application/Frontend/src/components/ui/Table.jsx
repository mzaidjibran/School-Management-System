export default function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th key={column.accessor} className="p-3 text-left border-b">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.accessor} className="p-3 border-b">
                  {row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
