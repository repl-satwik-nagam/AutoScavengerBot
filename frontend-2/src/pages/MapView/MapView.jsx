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
          width: "90%",
          display: "absolute",
          left: "50%",
          transform: "translate(-50%, 0)",
          marginTop: "10px",
          "& fieldset": { border: "none" },
          borderRadius: "5rem",
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
