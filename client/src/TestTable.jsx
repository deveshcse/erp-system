import React from 'react';
import ReactDOM from 'react-dom';

const TestTable = () => (
  <div className="p-10 bg-gray-100 h-screen">
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-left border-separate border-spacing-0 border border-b-0">
        <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-400">
          <tr>
            <th className="px-6 py-3">Header 1</th>
            <th className="px-6 py-3">Header 2</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-500">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">Data 1.1</td>
            <td className="px-6 py-4">Data 1.2</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">Data 2.1</td>
            <td className="px-6 py-4">Data 2.2</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default TestTable;
