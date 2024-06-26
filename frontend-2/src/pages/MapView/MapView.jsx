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
  const [loading, setLoading] = useState(false);
  const calgaryCoords = [-114.0719, 51.0547];
  const [searchText, setSearchText] = useState("");
  const [searchNum, setSearchNum] = useState(3);
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
    console.log(searchNum);
    if(!searchText.match("[a-zA-Z]+") || searchNum < 1 || searchNum > 20){
      handleToastOpen("error", "Please input a valid search")
    }else {
      fetchMarkersData();
    }
  }

  mapboxgl.accessToken =
    process.env.REACT_APP_MAPBOX_API_KEY ||
    "pk.eyJ1IjoibGF1cnkyMDAxIiwiYSI6ImNsdTVzaWh3djBrOG8ya3FybnJpZmNlY2QifQ.56T13WpUblGuqpzfD6n_SA";


  const fetchMarkersData = async () => {
    setLoading(true);
    console.log(searchNum);
    try {
      const response = await fetch(`http://autoscavengerlb-706009455.us-west-2.elb.amazonaws.com/findImageAndCoordinates?queryString=${searchText}&numberOfMatches=${searchNum}`);
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
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: calgaryCoords,
      zoom: 14,
    });

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            // When active the map will receive updates to the device's location as it changes.
            trackUserLocation: true,
            // Draw an arrow next to the location dot to indicate which direction the device is heading.
            showUserHeading: true
        }),
         "bottom-right"
    );

      const newMarkers = [];
      for (const markerData of markersData) {
        // Create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = `url(${markerData.url})`;

        const popup = new mapboxgl.Popup({
          maxWidth: "800px",
          maxHeight: "800px",
          closeButton: false,
        }).setHTML(`
          <div class="popup-card" style="text-align: center;">
            <img src="${markerData.url}" alt="picture" class="popup-image" />
          </div>
          <div class="popup-content" style="text-align: center;">
            <p style="margin: 0px; font-size: 14px; color: #979797;">
              Coordinates: ${markerData.latitude}, ${markerData.longitude}
            </p>
          </div>
        `);

        // Make a marker for each feature and add to the map
        const marker = new mapboxgl.Marker(el)
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
    <TextField
    sx={{
      marginLeft: "10px",
      input: {
        paddingLeft: "20px",
        paddingRight: "20px",
        color: "black",
        "&::placeholder": {
          opacity: 0.8,
        },
      },
      bgcolor: "white",
      color: "black",
      width: "30%",
      marginTop: "10px",
      "& fieldset": { border: "none" },
      border: "2px solid black",
      borderRadius: "5rem",
    }}
    onChange={(e) => setSearchNum(e.target.valueAsNumber)}
    placeholder="# of Results"
    value={searchNum}
          id="standard-number"
          label="# of Results"
          type="number"
          InputProps={{ inputProps: { min: 1, max: 20 }}}
          variant="standard"
          InputLabelProps={{
            shrink: true,
            sx: {
             left: "1rem",
             right: "1rem",
            }
          }}
        />
    <Button variant="contained" color="primary" onClick={handleSearch} sx={{ marginLeft: "10px", marginRight: "5px", marginTop: "10px", width: "10%" }}>
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


