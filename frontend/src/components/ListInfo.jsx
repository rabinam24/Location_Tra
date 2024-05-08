import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EditForm from "./Editform.jsx";
import "../ListInfo.css"

const List = ({ allInfo = [], setAllInfo, editContent, setEditContent }) => {
  const [edit, setEdit] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc");
  const [tableData, setTableData] = useState(allInfo);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Update table data when allInfo changes
  useEffect(() => {
    setTableData(allInfo);
  }, [allInfo]);

  // Function to handle sorting
  const handleSort = () => {
    const sortedData = [...tableData].sort((a, b) => {
      // Assuming location is a string property
      if (sortDirection === "asc") {
        return a.location.localeCompare(b.location);
      } else {
        return b.location.localeCompare(a.location);
      }
    });
    setTableData(sortedData);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Function to toggle edit mode
  const toggleEdit = (id) => {
    const info = allInfo.find((info) => info.id === id);
    setEditContent(info);
    setEdit(true);
  };

  // Function to handle delete
  const handleDelete = (id) => {
    const updatedInfo = allInfo.filter((info) => info.id !== id);
    setAllInfo(updatedInfo);
  };

  // Calculate pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);


return (
  <div className="list-container">
    <h1 className="text-3xl text-blue-900">User Data</h1>
    <table className="table-responsive">
      <thead>
        <tr>
          <th>
            Location{" "}
            <button className="sort-icon" onClick={handleSort}>
              {sortDirection === "asc"? "↑" : "↓"}
            </button>
          </th>
          <th>Gps Location</th>
          <th>Select ISP</th>
          <th>Select Pool</th>
          <th>Select Pool Status</th>
          <th>Select Pool Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {currentRows.map((info) => (
          <tr key={info.id}>
            <td>{info.location}</td>
            <td>{info.gpslocation}</td>
            <td>{info.selectisp}</td>
            <td>{info.selectpool}</td>
            <td>{info.selectpoolstatus}</td>
            <td>{info.selectpoollocation}</td>
            <td>
              <button
                className="edit-button"
                onClick={() => toggleEdit(info.id)}
              >
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(info.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Render EditForm if edit mode is enabled */}
    {edit && (
      <EditForm
        allInfo={allInfo}
        editContent={editContent}
        setAllInfo={setAllInfo}
        setEditContent={setEditContent}
        edit={edit}
        setEdit={setEdit}
      />
    )}

    {/* Pagination buttons */}
    {tableData.length > rowsPerPage && (
      <div className="pagination">
        <button
          className="previous"
          onClick={() =>
            setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
          }
          disabled={currentPage === 1}
        >
          ← Previous Page
        </button>
        <button
          className="next"
          onClick={() =>
            setCurrentPage((prevPage) =>
              Math.min(prevPage + 1, Math.ceil(tableData.length / rowsPerPage))
            )
          }
          disabled={indexOfLastRow >= tableData.length}
        >
          Next Page →
        </button>
      </div>
    )}

    {/* Link to view profiles */}
    <div>
      <Link to="/profiles">
        <button className="profile-button">View Profiles</button>
      </Link>
    </div>
  </div>
);
};

export default List;