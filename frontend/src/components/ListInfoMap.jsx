import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  useMediaQuery,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Container, Text, Paper as MantinePaper, SimpleGrid, useMantineTheme } from "@mantine/core";

const ListInfoMap = ({ locationData }) => {
  const headers = [
    "Select Pole",
    "Select Pole Status",
    "Select Pole Location",
    "Description",
    "Available ISP",
    "ISP",
  ];

  const renderCellContent = (info, header) => {
    switch (header) {
      case "Select Pole":
        return info.selectpole;
      case "Select Pole Status":
        return info.selectpolestatus;
      case "Select Pole Location":
        return info.selectpolelocation;
      case "Description":
        return info.description;
      case "Available ISP":
        return info.availableisp;
      case "ISP":
        return info.selectisp;
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
        <SimpleGrid cols={1} spacing="xs" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          {headers.map((header) => (
            <MantinePaper
              key={header}
              shadow="xs"
              radius="md"
              p="md"
              withBorder
              style={{ backgroundColor: mantineTheme.colors.gray[0] }}
            >
              <Text
                weight={700}
                size="sm"
                style={{ color: mantineTheme.colors.blue[7], marginBottom: mantineTheme.spacing.xs }}
              >
                {header}
              </Text>
              <Text size="sm" style={{ color: mantineTheme.colors.dark[9] }}>
                {renderCellContent(locationData, header)}
              </Text>
            </MantinePaper>
          ))}
        </SimpleGrid>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ border: 1, borderColor: "divider", backgroundColor: theme.palette.background.paper }}
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
              <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                {headers.map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      borderBottom: "1px solid rgba(224, 224, 224, 1)",
                      textAlign: "center",
                    }}
                  >
                    {renderCellContent(locationData, header)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ListInfoMap;
