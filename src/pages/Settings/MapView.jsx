import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import get from 'lodash/get';
import { GOOGLE_MAPS_API_KEY } from 'src/constants/AppConstants';

function MapView({ defaultCenter, markerLocation, setMarkerLocation, isSearchLocationSelected }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && markerLocation) {
      mapRef.current.panTo(markerLocation);
    }
  }, [markerLocation]);
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        ref={mapRef}
        defaultZoom={8}
        center={isSearchLocationSelected ? markerLocation : null}
        defaultCenter={!isSearchLocationSelected ? defaultCenter : null}
        gestureHandling="greedy"
        disableDefaultUI
        onClick={(event) => {
          const lat = Number(get(event, 'detail.latLng.lat')?.toPrecision(8));
          const lng = Number(get(event, 'detail.latLng.lng')?.toPrecision(8));
          setMarkerLocation({ lat, lng });
        }}
      >
        {markerLocation && (
          <Marker
            position={{
              lat: get(markerLocation, 'lat'),
              lng: get(markerLocation, 'lng'),
            }}
          />
        )}
      </Map>
    </APIProvider>
  );
}

export default MapView;
