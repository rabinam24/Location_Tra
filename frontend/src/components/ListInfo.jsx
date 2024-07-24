import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Grid,
  Text,
  Paper,
  ScrollArea,
  useMantineTheme,
  Container,
  SimpleGrid,
  Group,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import "./listinfo.css";
import "../ListInfo.css";
import { Box, Button, Typography, Modal } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};


const List = () => {
  const [allInfo, setAllInfo] = useState([]);
  const [sortDirection, setSortDirection] = useState("asc");
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null); // State to store the ID of the item to be deleted
  const rowsPerPage = 2;

  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080//user-data");
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

  const handleDateSort = () => {
    const sortedByDate = [...tableData].sort((a, b) => {
      if (sortDirection === "asc") {
        return a.created_at.localeCompare(b.created_at);
      } else {
        return b.created_at.localeCompare(a.created_at);
      }
    });
    setTableData(sortedByDate);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpen(true);
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/data/${deleteId}`);
      const updatedData = allInfo.filter((info) => info.id !== deleteId);
      setAllInfo(updatedData);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting data:", error);
      alert(
        `Error deleting data: ${error.response?.data?.message || error.message}`
      );
      setOpen(false);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  const headers = [
    "Location",
    "Pole",
    "Pole Status",
    "Pole Location",
    "Description",
    "Available ISP",
    "ISP",
    "Actions",
  ];

  const renderCellContent = (info, header) => {
    switch (header) {
      case "Location":
        return info.location;
      case "Pole":
        return info.selectpole;
      case "Pole Status":
        return info.selectpolestatus;
      case "Pole Location":
        return info.selectpolelocation;
      case "Description":
        return info.description;
      case "Available ISP":
        return info.availableisp;
      case "ISP":
        return info.selectisp;
      case "Actions":
        return (
          <Button
            variant="filled"
            color="red"
            className="delete-button"
            onClick={() => handleDeleteClick(info.id)}
          >
            Delete
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Container size="lg" px="xs" margin="10px">
      <Grid justify="center">
        <Grid.Col span={12} md={10}>
          <Group position="apart" mb="md">
            {/* <Text weight={500} size="lg" className="justify-center">
              List of Entries
            </Text> */}
          </Group>
          <Paper
            shadow="xs"
            p="md"
            margin="10px"
            style={isMobile ? { margin: "10px" } : {}}
          >
            <ScrollArea>
              {!isMobile ? (
                <Table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        Property
                      </th>
                      {currentRows.map((_, index) => (
                        <th
                          key={index}
                          style={{
                            border: "1px solid #ddd",
                            padding: "16px",
                            margin: "5px",
                            textAlign: "center",
                          }}
                        >
                          Entry {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((header) => (
                      <tr key={header}>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {header}
                        </td>
                        {currentRows.map((info, index) => (
                          <td
                            key={index}
                            style={{
                              border: "1px solid #ddd",
                              padding: "10px",
                              margin: "5px",
                              textAlign: "center",
                            }}
                          >
                            {renderCellContent(info, header)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <SimpleGrid padding="xs" cols={1} spacing="xs">
                  <Table style={{ width: "100%" }}>
                    {currentRows.map((info, index) => (
                      <Box
                        key={index}
                        p="md"
                        mb="xs"
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                        }}
                      >
                        {headers.map((header) => (
                          <Box key={header} mb="sm">
                            <Text weight={700} size="sm">
                              {header}
                            </Text>
                            <Text size="sm">
                              {renderCellContent(info, header)}
                            </Text>
                          </Box>
                        ))}
                        <Button
                          variant="filled"
                          color="error"
                          onClick={() => handleDeleteClick(info.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    ))}
                  </Table>
                </SimpleGrid>
              )}
            </ScrollArea>
          </Paper>
          {tableData.length > rowsPerPage && (
            <Group position="center" mt="md" margin="5px">
              {Array.from(
                { length: Math.ceil(tableData.length / rowsPerPage) },
                (_, index) => (
                  <Button
                    margin="5px"
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    variant={currentPage === index + 1 ? "filled" : "outline"}
                    color="blue"
                  >
                    {index + 1}
                  </Button>
                )
              )}
            </Group>
          )}
        </Grid.Col>
      </Grid>

      {/* Confirmation Dialog */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Are you sure you want to delete it ?
          </Typography>
          <Group position="center" mt="md">
            <Button
              onClick={handleClose}
              variant="outlined"
              style={{ marginRight: "20px" }}
            >
              No
            </Button>
            <Button
              onClick={handleDelete}
              className="delete-button"
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </Group>
        </Box>
      </Modal>
    </Container>
  );
};

export default List;
