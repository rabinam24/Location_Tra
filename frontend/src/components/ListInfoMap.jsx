import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useMediaQuery,
  Box,
  Modal,
  Button,
  Card,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Skeleton } from "@mantine/core";
import {
  Container,
  Text,
  Paper as MantinePaper,
  SimpleGrid,
  useMantineTheme,
} from "@mantine/core";
import axios from "axios";
import { motion } from "framer-motion";

const ListInfoMap = ({ locationData }) => {
  const headers = [
    "Pole",
    "Pole Status",
    "Pole Location",
    "Description",
    "Available ISP",
    "ISP",
    "Document",
  ];

  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateString, setDateString] = useState("");

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleUserDataClick = () => {
    setOpenModal(true);
    setLoading(false);
  };

  const isToday = (someDate) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  const getMarkerColor = (dateString) => {
    const dataDate = new Date(dateString);
    return isToday(dataDate) ? "blue" : "red";
  };

  useEffect(() => {
    const fetchDate = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user-data");
        setDateString(response.data.created_at); // Ensure the correct path to the date field
      } catch (error) {
        console.log("Error while fetching the date:", error);
      }
    };
    fetchDate();
  }, []);

  const renderCellContent = (info, header) => {
    switch (header) {
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
      case "Document":
        return (
          <Typography
            sx={{
              cursor: "pointer",
              color: getMarkerColor(dateString),
              textDecoration: "underline",
            }}
            onClick={handleUserDataClick}
          >
            Pole Image
          </Typography>
        );
      default:
        return null;
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const mantineTheme = useMantineTheme();

  return (
    <Container size="lg" px="xs">
      {isMobile ? (
        <SimpleGrid
          cols={1}
          spacing="xs"
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          {headers.map((header) => (
            <motion.div
              key={header}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MantinePaper
                shadow="xs"
                radius="md"
                p="md"
                withBorder
                style={{ backgroundColor: mantineTheme.colors.gray[0] }}
              >
                <Text
                  weight={700}
                  size="sm"
                  style={{
                    color: mantineTheme.colors.blue[7],
                    marginBottom: mantineTheme.spacing.xs,
                  }}
                >
                  {header}
                </Text>
                <Text size="sm" style={{ color: mantineTheme.colors.dark[9] }}>
                  {renderCellContent(locationData, header)}
                </Text>
              </MantinePaper>
            </motion.div>
          ))}
        </SimpleGrid>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            border: 1,
            borderColor: "divider",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Table sx={{ minWidth: 650, borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      border: 1,
                      borderColor: "divider",
                      textAlign: "center",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {headers.map((header) => (
                  <motion.td
                    key={header}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      borderBottom: "1px solid rgba(224, 224, 224, 1)",
                      textAlign: "center",
                    }}
                  >
                    {renderCellContent(locationData, header)}
                  </motion.td>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "600px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={300} />
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <img
                    src={locationData.poleimage_url}
                    alt="Pole"
                    style={{ width: "100%", height: "auto" }}
                  />
                </Card>
              </Grid>
              {locationData.multipleimages_urls.map((imageUrl, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card>
                    <img
                      src={imageUrl}
                      alt={`Location ${index}`}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <Button
            onClick={handleCloseModal}
            color="error"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default ListInfoMap;
