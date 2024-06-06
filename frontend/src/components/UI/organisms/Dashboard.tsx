import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import theme from "../../../Theme";
import { DashboardWidgetWrapper } from "../atoms/DashboardWidgetWrapper";
import { DashboardInfo } from "../molecules/DashboardInfo";
import { DashboardSummary } from "../molecules/DashboardSummary";
import { Box } from "@mui/system";
import { GoogleMap, Marker } from "@react-google-maps/api";
import OverlayStyles from "../../styling/OverlayStyles";
import MapRestriction = google.maps.MapRestriction;

interface PlaceMarker {
  image: string;
  location: LatLngLiteral;
}

const MAP_RESTRICTION: MapRestriction = {
  latLngBounds: {
    north: 85,
    south: -85,
    west: -180,
    east: 180,
  },
  strictBounds: true,
};

const l1 = {lat: 51.045, lng: -114.072};
const l2 = {lat: 52.045, lng: -115.072}

interface DashboardProps {
  query?: string;
}

import LatLngLiteral = google.maps.LatLngLiteral;
import { Backdrop } from "@mui/material";

const DEFAULT_MAP_CENTER: LatLngLiteral = {
  lat: 51.045,
  lng: -114.072,
};
const DEFAULT_MAP_ZOOM = 11;

/*const intoMarkers = (locations: Coordinates[]): PlaceMarker[] =>
  locations
    .map((location) =>
      location.map((location) => ({
        person: person,
        location: {
          lat: Number(incident.coordinates[1]),
          lng: Number(incident.coordinates[0]),
        },
        type: incident.type,
        icon: incidentIcon(incident.type),
        time: new Date(incident.timestamp),
      }))
    )
    .flat();

/* see https://mui.com/styles/basics/ */
const useStyles = makeStyles({
  tooltipText: {
    margin: "8px",
    whiteSpace: "nowrap",
  },
});

export const Dashboard = () => {
  //const data = this?.state.query;
  const overlayStyles = OverlayStyles();
  const styles = useStyles();
  return (
    <div className={overlayStyles.parent}>
      <h2> Query for test </h2>
    <div style={{ height: '90vh', width: '100%' }}>
    <GoogleMap
      mapContainerStyle={{
        height: "100%",
        width: "100%",
      }}
      options={{
        gestureHandling: "greedy",
        restriction: MAP_RESTRICTION,
      }}
      zoom={DEFAULT_MAP_ZOOM}
      center={DEFAULT_MAP_CENTER}
    >
        <Marker
          position={l1}
        />
        <Marker
          position={l2}
          />
    </GoogleMap>
    </div>
  </div>
);
};
