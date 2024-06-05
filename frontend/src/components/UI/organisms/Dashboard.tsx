import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import theme from "../../../Theme";
import { DashboardWidgetWrapper } from "../atoms/DashboardWidgetWrapper";
import { DashboardInfo } from "../molecules/DashboardInfo";
import { DashboardSummary } from "../molecules/DashboardSummary";
import { Box } from "@mui/system";
import { GoogleMap } from "@react-google-maps/api";
import MapRestriction = google.maps.MapRestriction;

const MAP_RESTRICTION: MapRestriction = {
  latLngBounds: {
    north: 85,
    south: -85,
    west: -180,
    east: 180,
  },
  strictBounds: true,
};

import LatLngLiteral = google.maps.LatLngLiteral;

const DEFAULT_MAP_CENTER: LatLngLiteral = {
  lat: 51.045,
  lng: -114.072,
};
const DEFAULT_MAP_ZOOM = 11;


/* see https://mui.com/styles/basics/ */


export const Dashboard = () => {

  return (
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
    </GoogleMap>
  );
};
