import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import TextField from "@mui/material/TextField";
import "./MapView.css";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button"
import {
  Unstable_NumberInput as BaseNumberInput,
  NumberInputProps,
} from '@mui/base/Unstable_NumberInput';
import { styled } from '@mui/system';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

import ToastNotification from "../../components/ToastNotification/ToastNotificaiton";

import { CircularProgress } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";

const MapView = ({}) => {
  const [, setMarkers] = useState([]);
  const [markersData, setMarkersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const calgaryCoords = [-114.0719, 51.0547];
  const [searchText, setSearchText] = useState("");
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastSeverity, setToastSeverity] = React.useState("success");
  const [toastMessage, setToastMessage] = React.useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedSighting, setSelectedSighting] = useState(null);

  const handleToastOpen = (severity, message) => {
    setToastSeverity(severity);
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleToastClose = (event, reason) => {
    setToastOpen(false);
  };

  const handleSearch = () => {
    console.log("enter hit")
    if(!searchText.match("[a-zA-Z]+")){
      handleToastOpen("error", "Please input a valid search")
    }else {
      fetchMarkersData(searchText);
    }
  }

  mapboxgl.accessToken =
    process.env.REACT_APP_MAPBOX_API_KEY ||
    "pk.eyJ1IjoibGF1cnkyMDAxIiwiYSI6ImNsdTVzaWh3djBrOG8ya3FybnJpZmNlY2QifQ.56T13WpUblGuqpzfD6n_SA";


  const fetchMarkersData = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`http://autoscavengerlb-706009455.us-west-2.elb.amazonaws.com/findImageAndCoordinates?queryString=${query}`);
      const data = await response.json();
      console.log(data);
      setMarkersData(data);
      setLoading(false);
    } catch (error) {
      handleToastOpen("error", "Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (markersData.length === 0) return;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: calgaryCoords,
      zoom: 14,
    });

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      const newMarkers = [];
      for (const markerData of markersData) {
        const popup = new mapboxgl.Popup({
          maxWidth: "400px",
          closeButton: false,
        }).setHTML(`
          <div class="popup-card">
            <img src="${markerData.url}" alt="picture" class="popup-image" />
            <div class="popup-content">
              <h2 style="margin: 0px">Location</h2>
              <p style="margin: 0px; font-size: 14px; color: #979797;">
                Coordinates: ${markerData.latitude}, ${markerData.longitude}
              </p>
            </div>
          </div>
        `);
        const marker = new mapboxgl.Marker({
          color: "red",
        })
          .setLngLat([markerData.latitude, markerData.longitude])
          .setPopup(popup)
          .addTo(map);

        newMarkers.push(marker);
      }
      setMarkers(newMarkers);
    });

    return () => map.remove();
  }, [markersData]);

  return (
  <>
  <div id="map">
    {loading && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          zIndex: 1,
        }}
      >
        <CircularProgress />
      </div>
    )}
  </div>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
    <TextField
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSearch();
      }}
      className="search_bar"
      onChange={(e) => setSearchText(e.target.value.toLowerCase())}
      focused
      id="search-text"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "black" }} />
          </InputAdornment>
        ),
      }}
      placeholder="Search"
      value={searchText}
      sx={{
        input: {
          color: "black",
          "&::placeholder": {
            opacity: 0.8,
          },
        },
        bgcolor: "white",
        color: "black",
        width: "50%",
        marginTop: "10px",
        "& fieldset": { border: "none" },
        borderRadius: "5rem",
        border: "2px solid black",
      }}
    />
    <BaseNumberInput
    aria-label="Demo number input"
    placeholder="# of Results"
    min={1}
    max={10}
    sx={{ marginLeft: "10px", marginRight: "10px", width: "30%", zIndex: "99" }} // Add margin to separate from the text field
      slots={{
        root: StyledInputRoot,
        input: StyledInput,
        incrementButton: StyledButton,
        decrementButton: StyledButton,
      }}
      slotProps={{
        incrementButton: {
          children: <AddIcon fontSize="small" />,
          className: 'increment',
        },
        decrementButton: {
          children: <RemoveIcon fontSize="small" />,
        },
      }}
    />

    
    <Button variant="contained" color="primary" onClick={handleSearch} sx={{ marginLeft: "10px", marginRight: "10px", width: "10%" }}>
      Submit
    </Button>
  </div>
  <ToastNotification
    open={toastOpen}
    severity={toastSeverity}
    message={toastMessage}
    handleClose={handleToastClose}
  />
</>

  );
};

export function QuantityInput() {
  return <BaseNumberInput aria-label="Quantity Input" min={1} max={20} />;
}

const blue = {
  100: '#daecff',
  200: '#b6daff',
  300: '#66b2ff',
  400: '#3399ff',
  500: '#007fff',
  600: '#0072e5',
  700: '#0059B2',
  800: '#004c99',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[500]};
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`,
);

const StyledInput = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.375;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 4px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'
  };
  border-radius: 8px;
  margin: 0 8px;
  padding: 10px 12px;
  outline: 0;
  min-width: 0;
  width: 4rem;
  text-align: center;

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[700] : blue[200]};
  }

  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledButton = styled('button')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 999px;
  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  width: 32px;
  height: 32px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    cursor: pointer;
    background: ${theme.palette.mode === 'dark' ? blue[700] : blue[500]};
    border-color: ${theme.palette.mode === 'dark' ? blue[500] : blue[400]};
    color: ${grey[50]};
  }

  &:focus-visible {
    outline: 0;
  }

  &.increment {
    order: 1;
  }
`,
);

export default MapView;


