import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Table, 
  Button, 
  Grid, 
  Text, 
  Box, 
  Paper, 
  ScrollArea, 
  useMantineTheme, 
  Container, 
  SimpleGrid, 
  Group 
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import "./listinfo.css";

const List = () => {
  const [allInfo, setAllInfo] = useState([]);
  const [sortDirection, setSortDirection] = useState("asc");
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

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
      alert(`Error deleting data: ${error.response?.data?.message || error.message}`);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  const headers = [
    "Location",
    "Selected Pole",
    "Selected Pole Status",
    "Selected Pole Location",
    "Description",
    "Available ISP",
    "Selected ISP",
    "Actions"
  ];

  const renderCellContent = (info, header) => {
    switch (header) {
      case "Location":
        return info.location;
      case "Selected Pole":
        return info.selectpole;
      case "Selected Pole Status":
        return info.selectpolestatus;
      case "Selected Pole Location":
        return info.selectpolelocation;
      case "Description":
        return info.description;
      case "Available ISP":
        return info.availableisp;
      case "Selected ISP":
        return info.selectisp;
      case "Actions":
        return (
          <Button 
            variant="filled" 
            color="red" 
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
    <Container size="lg" px="xs" margin='10px'>
      <Grid justify="center">
        <Grid.Col span={12} md={10}>
          <Group position="apart" mb="md">
            <Text weight={500} size="lg">List of Entries</Text>
            <Button variant="filled" color="blue" onClick={handleSort}>
              Sort by hyy
            </Button>
          </Group>
          <Paper shadow="xs" p="md" margin="10px" style={isMobile? {margin:'10px'}:{}}>
            <ScrollArea>
              {!isMobile ? (
                <Table style={{ borderCollapse:'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Property</th>
                      {currentRows.map((_, index) => (
                        <th key={index} style={{ border: '1px solid #ddd', padding: '16px', margin:'5px' }}>Entry {index + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((header) => (
                      <tr key={header}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{header}</td>
                        {currentRows.map((info, index) => (
                          <td key={index} style={{ border: '1px solid #ddd', padding: '10px', margin:'5px' }}>{renderCellContent(info, header)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <SimpleGrid padding= 'xs' cols={1} spacing="xs" >
                <Table style={{  width: '100%' }}>
                  {currentRows.map((info, index) => (
                    <Box key={index} p="md" mb="xs" style={{ border: '1px solid #ddd', borderRadius: '5px' }}>
                      {headers.map((header) => (
                        <Box key={header} mb="sm">
                          <Text weight={700} size="sm">{header}</Text>
                          <Text size="sm">{renderCellContent(info, header)}</Text>
                        </Box>
                      ))}
                      <Button 
                        variant="filled" 
                        color="red" 
                        onClick={() => handleDelete(info.id)}
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
            <Group position="center" mt="md">
              {Array.from(
                { length: Math.ceil(tableData.length / rowsPerPage) },
                (_, index) => (
                  <Button
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
    </Container>
  );
};

export default List;
