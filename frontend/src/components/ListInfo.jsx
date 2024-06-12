import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ListInfo.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const List = () => {
  const [allInfo, setAllInfo] = useState([]);
  const [edit, setEdit] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/get-form-data");
        setAllInfo(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setTableData(allInfo || []);
  }, [allInfo]);

  const handleSort = () => {
    const sortedData = [...tableData].sort((a, b) => {
      if (sortDirection === "asc") {
        return a.location.localeCompare(b.location);
      } else {
        return b.location.localeCompare(a.location);
      }
    });
    setTableData(sortedData);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/data/${id}`);
      const updatedData = allInfo.filter((info) => info.id !== id);
      setAllInfo(updatedData);
    } catch (error) {
      console.error("Error deleting data:", error);
      alert(
        `Error deleting data: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="table-container">
      <TableContainer component={Paper} className="custom-table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={handleSort}>
                Location {sortDirection === "asc" ? "↑" : "↓"}
              </TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Select Pole</TableCell>
              <TableCell>Select Pole Status</TableCell>
              <TableCell>Select Pole Location</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Pole Image</TableCell>
              <TableCell>Available ISP</TableCell>
              <TableCell>Select ISP</TableCell>
              <TableCell>Multiple Images</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.map((info) => (
              <TableRow key={info.id}>
                <TableCell>{info.location}</TableCell>
                <TableCell>{info.latitude}</TableCell>
                <TableCell>{info.longitude}</TableCell>
                <TableCell>{info.selectpole}</TableCell>
                <TableCell>{info.selectpolestatus}</TableCell>
                <TableCell>{info.selectpolelocation}</TableCell>
                <TableCell>{info.description}</TableCell>
                <TableCell>
                  {info.poleimage && (
                    <img src={info.poleimage} alt="Pole" style={{ width: "100px", height: "100px" }} />
                  )}
                </TableCell>
                <TableCell>{info.availableisp}</TableCell>
                <TableCell>{info.selectisp}</TableCell>
                <TableCell>
                  {info.multipleimages && info.multipleimages.map((image, index) => (
                    <img key={index} src={image} alt={`Multiple ${index}`} style={{ width: "100px", height: "100px" }} />
                  ))}
                </TableCell>
                <TableCell>
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
      {tableData.length > rowsPerPage && (
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(tableData.length / rowsPerPage) },
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      )}
      {edit && (
        <div className="edit-form-container">
          {/* <EditForm
            editContent={editContent}
            setEditContent={setEditContent}
            setEdit={setEdit}
            allInfo={allInfo}
            setAllInfo={setAllInfo}
          /> */}
        </div>
      )}
    </div>
  );
};

export default List;
