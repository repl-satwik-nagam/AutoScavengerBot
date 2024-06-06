import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import TextField from "@mui/material/TextField";
import "./MapView.css";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

import ToastNotification from "../../components/ToastNotification/ToastNotificaiton";

import { CircularProgress } from "@mui/material";

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-114.081336, 51.055725],
      },
      properties: {
        title: "Test Area #1",
        description: "This is test #1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-114.057816, 51.05013],
      },
      properties: {
        title: "Test Area #2",
        description: "This is test #2",
      },
    },
  ],
};

const MapView = ({}) => {
  const [, setMarkers] = useState([]);
  const [markersData, setMarkersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const calgaryCoords = [-114.0719, 51.0547];
  const [searchText, setSearchText] = useState("");
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastSeverity, setToastSeverity] = React.useState("success");
  const [toastMessage, setToastMessage] = React.useState("");

  const openDialog = (id) => {
    setOpen(true);
    setSelectedId(id);
  };

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
      //connect to backend
    }
  }

  useEffect(() => {}, []);
  const handleChange = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  mapboxgl.accessToken =
    process.env.REACT_APP_MAPBOX_API_KEY ||
    "pk.eyJ1IjoibGF1cnkyMDAxIiwiYSI6ImNsdTVzaWh3djBrOG8ya3FybnJpZmNlY2QifQ.56T13WpUblGuqpzfD6n_SA";

  // Initialize the map
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: calgaryCoords,
      zoom: 14,
    });

    map.on("load", () => {
      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      // Add markers
      const newMarkers = [];
      for (const markerData of geojson.features) {
        const popup = new mapboxgl.Popup({
          maxWidth: "400px",
          closeButton: false,
        }).setHTML(`
          <div id="popup-${markerData.id}" class="popup-card">
            <img src="${markerData.image}" alt="picture" class="popup-image" />
            <div class="popup-content">
              ${`<h2 style="margin: 0px">${markerData.properties.title}</h2>`}
              <Typography style="margin: 0px; font-size: 14px; color: #979797;">
                ${markerData.properties.description}
              </Typography>
            </div>
          </div>
      `);

        const marker = new mapboxgl.Marker({
          color: "red",
        })
          .setLngLat([
            markerData.geometry.coordinates[0],
            markerData.geometry.coordinates[1],
          ])
          .setPopup(popup)
          .addTo(map);

        newMarkers.push(marker);

        popup.on("open", () => {
          const popupElement = document.getElementById(
            `popup-${markerData.id}`
          );
          popupElement.addEventListener("click", (e) => {
            e.preventDefault();
            if (markerData.status === "SIGHTING") {
              setSelectedSighting(markerData);
              openDialog(markerData.id);
            } else {
              window.location.href = `/posts/${markerData.id}`;
            }
          });
        });
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
      <TextField
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        className="search_bar"
        onChange={handleChange}
        focused
        id="search-text"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "white" }} />
            </InputAdornment>
          ),
        }}
        placeholder="Search"
        value={searchText}
        sx={{
          input: {
            color: "white",
            "&::placeholder": {
              opacity: 0.8,
            },
          },
          bgcolor: "#b8c1ec",
          color: "white",
          width: "90%",
          display: "absolute",
          left: "50%",
          transform: "translate(-50%, 0)",
          marginTop: "10px",
          "& fieldset": { border: "none" },
          borderRadius: "10px",
          border: "2px solid black",
        }}
      />

      <ToastNotification
        open={toastOpen}
        severity={toastSeverity}
        message={toastMessage}
        handleClose={handleToastClose}
      />
    </>
  );
};

export default MapView;
