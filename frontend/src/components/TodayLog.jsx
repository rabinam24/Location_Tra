import React from 'react';

const data = [
  { id: "1", started: "10:00 am", ended: "11:00 am", km_covered:"5 kms", pooldataentry:"20"},
  { id: "2", started: "01:00 pm", ended: "2:00 pm", km_covered:"5 kms", pooldataentry:"20"},
  { id: "3", started: "03:00 pm", ended: "4:00 pm", km_covered:"5 kms", pooldataentry:"20"},
]

function TodayLog() {
  return (
    <div className='max-w-md mx-auto p-4 pt-6'>
      <div className='text-4xl font-bold mb-4'>
        Today's Log
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm text-left text-white text-white-400">
          <thead className="text-xs text-white uppercase  dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Id</th>
              <th scope="col" className="px-6 py-3">Started</th>
              <th scope="col" className="px-6 py-3">Ended</th>
              <th scope="col" className="px-6 py-3">Kms Covered</th>
              <th scope="col" className="px-6 py-3">Pool Data Entry</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, key) => {
              return (
                <tr key={key} className=" border-b dark:bg-gray-800 dark:border-gray-700 ">
                  <td className="px-6 py-4">{val.id}</td>
                  <td className="px-6 py-4">{val.started}</td>
                  <td className="px-6 py-4">{val.ended}</td>
                  <td className="px-6 py-4">{val.km_covered}</td>
                  <td className="px-6 py-4">{val.pooldataentry}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TodayLog;