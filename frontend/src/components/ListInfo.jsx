import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EditForm from "./Editform.jsx";
import "../ListInfo.css"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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
    
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Location</TableCell>
            <TableCell>Gps Location</TableCell>
            <TableCell>Select Pool</TableCell>
            <TableCell>Select Pool Status</TableCell>
            <TableCell>Select Pool Location</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentRows.map((row) => (
            <TableRow
              key={row.id}
            >
              <TableCell>{row.location}</TableCell>
              <TableCell>{row.gpslocation}</TableCell>
              <TableCell>{row.selectpool}</TableCell>
              <TableCell>{row.selectpoolstatus}</TableCell>
              <TableCell>{row.selectpoollocation}</TableCell>
              <TableCell><button
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
              </TableCell>

            </TableRow>
            
          ))}
        </TableBody>
      </Table>
    </TableContainer>

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