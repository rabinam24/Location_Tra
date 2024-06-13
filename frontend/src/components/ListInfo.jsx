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
import { Grid, Button, Typography, Box } from "@mui/material";

const List = () => {
  const [allInfo, setAllInfo] = useState([]);
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

  const headers = [
    "Location",
    "Latitude",
    "Longitude",
    "Select Pole",
    "Select Pole Status",
    "Select Pole Location",
    "Description",
    "Pole Image",
    "Available ISP",
    "Select ISP",
    "Multiple Images",
    "Actions"
  ];

  const renderCellContent = (info, header) => {
    switch (header) {
      case "Location":
        return info.location;
      case "Latitude":
        return info.latitude;
      case "Longitude":
        return info.longitude;
      case "Select Pole":
        return info.selectpole;
      case "Select Pole Status":
        return info.selectpolestatus;
      case "Select Pole Location":
        return info.selectpolelocation;
      case "Description":
        return info.description;
      case "Pole Image":
        return info.poleimage && (
          <img src={info.poleimage} alt="Pole" style={{ width: "100px", height: "100px" }} />
        );
      case "Available ISP":
        return info.availableisp;
      case "Select ISP":
        return info.selectisp;
      case "Multiple Images":
        return info.multipleimages && info.multipleimages.map((image, index) => (
          <img key={index} src={image} alt={`Multiple ${index}`} style={{ width: "100px", height: "100px" }} />
        ));
      case "Actions":
        return (
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => handleDelete(info.id)}
          >
            Delete
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} md={10}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">List of Entries</Typography>
          <Button variant="contained" color="primary" onClick={handleSort}>
            Sort by Location
          </Button>
        </Box>
        <TableContainer component={Paper} className="custom-table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                {currentRows.map((_, index) => (
                  <TableCell key={index}>Entry {index + 1}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {headers.map((header) => (
                <TableRow key={header}>
                  <TableCell>{header}</TableCell>
                  {currentRows.map((info, index) => (
                    <TableCell key={index}>{renderCellContent(info, header)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {tableData.length > rowsPerPage && (
          <Box display="flex" justifyContent="center" mt={2}>
            {Array.from(
              { length: Math.ceil(tableData.length / rowsPerPage) },
              (_, index) => (
                <Button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={currentPage === index + 1 ? "active" : ""}
                >
                  {index + 1}
                </Button>
              )
            )}
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default List;
