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

const ListInfoMap = ({ locationData }) => {
  const headers = [
    "Select Pole",
    "Select Pole Status",
    "Select Pole Location",
    "Description",
    "Available ISP",
    "Select ISP",
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
      case "Select ISP":
        return info.selectisp;
      default:
        return null;
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <TableContainer
      component={Paper}
      className="custom-table-container"
      sx={{ border: 1, borderColor: "divider", backgroundColor: theme.palette.background.paper }}
    >
      {isMobile ? (
        <Box>
          {headers.map((header) => (
            <Box key={header} sx={{ display: "flex", flexDirection: "row", borderBottom: "1px solid rgba(224, 224, 224, 1)" }}>
              <Box sx={{ flex: 1, padding: "8px", backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: "bold" }}>
                {header}
              </Box>
              <Box sx={{ flex: 1, padding: "8px", color: theme.palette.text.primary }}>
                {renderCellContent(locationData, header)}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
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
      )}
    </TableContainer>
  );
};

export default ListInfoMap;
