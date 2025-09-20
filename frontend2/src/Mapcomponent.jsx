import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './MapComponent.css'

const MapComponent = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [showLocationError, setShowLocationError] = useState(false);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const mapContainerRef = useRef(null);

  const supplyBases = [
    { name: "Base A", lat: 20.46891, lon: 85.77413, supplies: 120 },
    { name: "Base B", lat: 20.46481, lon: 85.76340, supplies: 75 },
    { name: "Base C", lat: 20.44825, lon: 85.76683, supplies: 30 }
  ];

 const getSupplyColor = (supplies) => {
  if (supplies > 100) return "#00ff00"; // neon green
  if (supplies >= 50) return "#33cc33";
  return "#006600"; 
};

  // Effect to get the user's geolocation once on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lon: longitude });
        },
        () => {
          console.error("Location access denied.");
          setShowLocationError(true);
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
      setShowLocationError(true);
    }
  }, []);

  // Effect to initialize the map when userLocation is available
  useEffect(() => {
    if (!userLocation || !mapContainerRef.current) return;

    // Initialize map instance and assign it to the ref
    const map = L.map(mapContainerRef.current).setView([userLocation.lat, userLocation.lon], 14);
    mapRef.current = map;

    // Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
  className: "green-map" // 👈 we'll style it below
}).addTo(map);


    // Add user marker
    L.marker([userLocation.lat, userLocation.lon])
      .addTo(map)
      .bindPopup("You are here").openPopup();

    // Add supply base markers
    supplyBases.forEach(base => {
      L.circleMarker([base.lat, base.lon], {
        radius: 10,
        fillColor: getSupplyColor(base.supplies),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map)
        .bindPopup(`<b>${base.name}</b><br>Supplies: ${base.supplies}`);
    });

    // Handle map click to set destination
    map.on('click', (e) => {
      const clickedLat = e.latlng.lat;
      const clickedLon = e.latlng.lng;

      // Automatically set the destination without a popup
      setDestination({ lat: clickedLat, lon: clickedLon });
    });

    // Cleanup function to remove the map on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation]);

  // Effect to handle routing when a destination is set
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || !destination) return;

    // Remove previous route and marker if they exist
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }
    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
    }
    
    // Add new destination marker
    destinationMarkerRef.current = L.marker([destination.lat, destination.lon])
      .addTo(map)
      .bindPopup("Destination").openPopup();

    // Create new routing control
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lon),
        L.latLng(destination.lat, destination.lon)
      ],
      routeWhileDragging: true,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      show:false,
      // Customize the route line to match the provided color scheme
      lineOptions: {
        styles: [{color: 'green', weight: 8, opacity: 0.6}]
      }
    }).addTo(map);

    // Auto zoom to fit the route
    routingControlRef.current.on('routesfound', (e) => {
      const route = e.routes[0];
      const bounds = L.latLngBounds(route.coordinates);
      map.fitBounds(bounds, { padding: [30, 30] });
    });
  }, [destination, userLocation]);

  // Conditional rendering based on location access
  if (!userLocation) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-900 text-green-500">
        <h1 className="text-xl">Getting your location...</h1>
        {showLocationError && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto">
              <h2 className="text-lg font-bold text-red-500 mb-2">Location Access Denied</h2>
              <p className="text-gray-700 mb-4">
                Please allow location access to use this feature. If you have blocked it, you may need to enable it in your browser settings.
              </p>
              <button
                onClick={() => setShowLocationError(false)}
                className="w-full px-4 py-2 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="map-container" ref={mapContainerRef} className="h-full w-full"></div>
  );
};

export default MapComponent;
