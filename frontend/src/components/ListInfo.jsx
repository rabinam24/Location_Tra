import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Table, 
  Image, 
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
          <Image src={info.poleimage} alt="Pole" width={100} height={100} />
        );
      case "Available ISP":
        return info.availableisp;
      case "Select ISP":
        return info.selectisp;
      case "Multiple Images":
        return info.multipleimages && info.multipleimages.map((image, index) => (
          <Image key={index} src={image} alt={`Multiple ${index}`} width={100} height={100} />
        ));
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
    <Container size="lg" px="xs">
      <Grid justify="center">
        <Grid.Col span={12} md={10}>
          <Group position="apart" mb="md">
            <Text weight={500} size="lg">List of Entries</Text>
            <Button variant="filled" color="blue" onClick={handleSort}>
              Sort by Location
            </Button>
          </Group>
          <Paper shadow="xs" p="md">
            <ScrollArea>
              {!isMobile ? (
                <Table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Property</th>
                      {currentRows.map((_, index) => (
                        <th key={index} style={{ border: '1px solid #ddd', padding: '8px' }}>Entry {index + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((header) => (
                      <tr key={header}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{header}</td>
                        {currentRows.map((info, index) => (
                          <td key={index} style={{ border: '1px solid #ddd', padding: '8px' }}>{renderCellContent(info, header)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <SimpleGrid cols={1} spacing="xs">
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
