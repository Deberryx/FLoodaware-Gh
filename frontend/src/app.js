import React, { useState, useEffect, useRef } from 'react';
import { Camera, Droplets, Map, AlertTriangle, BookOpen, Home, Upload, Navigation, MapPin } from 'lucide-react';

// Water level definitions
const WATER_LEVELS = [
  { value: 0, label: 'Dry', color: '#10b981', icon: '👟' },
  { value: 1, label: 'Ankle', color: '#eab308', icon: '🦶' },
  { value: 2, label: 'Knee', color: '#f97316', icon: '🦵' },
  { value: 3, label: 'Waist', color: '#ef4444', icon: '🚶' },
  { value: 4, label: 'Chest', color: '#dc2626', icon: '🏊' },
  { value: 5, label: 'Overhead', color: '#991b1b', icon: '🌊' }
];

// Mock flood data for demonstration
const mockFloodTags = [
  { id: 1, lat: 5.6037, lng: -0.1870, waterLevel: 2, comment: "Near Kwame Nkrumah Circle", verified: true, createdAt: new Date() },
  { id: 2, lat: 5.5560, lng: -0.1969, waterLevel: 3, comment: "Odorkor area flooding", verified: false, createdAt: new Date() },
  { id: 3, lat: 5.6140, lng: -0.2057, waterLevel: 1, comment: "Minor flooding at Dansoman", verified: true, createdAt: new Date() }
];

// Simple Map Component using OpenStreetMap tiles
const SimpleMap = ({ center, zoom = 13, height = "400px", onLocationSelect, markers = [], showUserLocation = true }) => {
  const mapRef = useRef(null);
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    // Generate static map URL with OpenStreetMap
    const baseUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center[1] - 0.05},${center[0] - 0.05},${center[1] + 0.05},${center[0] + 0.05}&layer=mapnik`;
    setMapUrl(baseUrl);
  }, [center]);

  const handleMapClick = (e) => {
    if (!onLocationSelect) return;
    
    // Simple approximation for demo - in production, use proper map library
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click position to approximate lat/lng
    const latRange = 0.1; // Approximate range shown on map
    const lngRange = 0.1;
    
    const lat = center[0] + (0.5 - y / rect.height) * latRange;
    const lng = center[1] + (x / rect.width - 0.5) * lngRange;
    
    onLocationSelect([lat, lng]);
  };

  return (
    <div className="relative" style={{ height }}>
      <iframe
        ref={mapRef}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={mapUrl}
        className="rounded-lg"
        onClick={handleMapClick}
      />
      
      {/* Overlay for markers */}
      <div className="absolute inset-0 pointer-events-none">
        {showUserLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        )}
        
        {markers.map((marker, index) => (
          <div 
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              top: '50%',
              left: '50%',
              // Simple positioning - in production use proper projection
              marginTop: `${(center[0] - marker.lat) * 1000}px`,
              marginLeft: `${(marker.lng - center[1]) * 1000}px`
            }}
          >
            <div 
              className="rounded-full border-2 shadow-lg"
              style={{
                width: `${20 + marker.waterLevel * 8}px`,
                height: `${20 + marker.waterLevel * 8}px`,
                backgroundColor: WATER_LEVELS[marker.waterLevel].color,
                borderColor: marker.verified ? '#16a34a' : '#6b7280',
                opacity: 0.7
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Click overlay for interaction */}
      {onLocationSelect && (
        <div 
          className="absolute inset-0 cursor-crosshair"
          onClick={handleMapClick}
        />
      )}
    </div>
  );
};

// Main App Component
export default function FloodAwareApp() {
  const [currentView, setCurrentView] = useState('home');
  const [floodTags, setFloodTags] = useState(mockFloodTags);
  const [userLocation, setUserLocation] = useState([5.6037, -0.1870]); // Default to Accra
  const [isLoading, setIsLoading] = useState(false);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Location error:", error);
        }
      );
    }
  }, []);

  // Tag Flood Area Component
  const TagFloodArea = () => {
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [waterLevel, setWaterLevel] = useState(0);
    const [comment, setComment] = useState('');
    const [photo, setPhoto] = useState(null);
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);

    const handleUseCurrentLocation = () => {
      setSelectedPosition(userLocation);
      setUseCurrentLocation(true);
    };

    const handleSubmit = async () => {
      if (!selectedPosition && !useCurrentLocation) {
        alert('Please select a location or use your current location');
        return;
      }

      setIsLoading(true);
      
      // TODO: Firebase integration
      const newTag = {
        id: Date.now(),
        lat: selectedPosition ? selectedPosition[0] : userLocation[0],
        lng: selectedPosition ? selectedPosition[1] : userLocation[1],
        waterLevel,
        comment,
        verified: false,
        createdAt: new Date(),
        photoURL: photo ? URL.createObjectURL(photo) : null
      };

      setFloodTags([...floodTags, newTag]);
      
      setTimeout(() => {
        setIsLoading(false);
        alert('Flood area tagged successfully!');
        setCurrentView('map');
      }, 1000);
    };

    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Droplets className="text-blue-500" />
            Tag Flood Area
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              1. Select location
            </label>
            
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Navigation size={20} />
                Use Current Location
              </button>
              {useCurrentLocation && (
                <span className="flex items-center text-green-600 text-sm">
                  ✓ Using your location
                </span>
              )}
            </div>

            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <SimpleMap 
                center={userLocation} 
                height="250px"
                onLocationSelect={setSelectedPosition}
                markers={selectedPosition ? [{ ...selectedPosition, waterLevel: 0 }] : []}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Click on the map to select a flood location
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              2. Select water level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WATER_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setWaterLevel(level.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    waterLevel === level.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{level.icon}</div>
                  <div className="text-sm font-medium">{level.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              3. Add photo (optional)
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                <Camera size={20} />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />
              </label>
              {photo && <span className="text-sm text-green-600">✓ Photo selected</span>}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              4. Add comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows="3"
              placeholder="Describe the flooding situation..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isLoading ? 'Submitting...' : 'Submit Flood Report'}
          </button>
        </div>
      </div>
    );
  };

  // Flood Map Component
  const FloodMap = () => {
    return (
      <div className="h-screen relative">
        <div className="h-full">
          <SimpleMap 
            center={userLocation} 
            height="100%"
            markers={floodTags}
          />
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-2">Water Levels</h3>
          <div className="space-y-1">
            {WATER_LEVELS.slice(1).map((level) => (
              <div key={level.value} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: level.color }}
                />
                <span>{level.icon} {level.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-green-600" />
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
              <span>Unverified</span>
            </div>
          </div>
        </div>

        {/* Flood Reports List */}
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Recent Reports</h3>
          <div className="space-y-2">
            {floodTags.map((tag) => (
              <div key={tag.id} className="border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{WATER_LEVELS[tag.waterLevel].icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {WATER_LEVELS[tag.waterLevel].label} level
                    </div>
                    <div className="text-xs text-gray-600">{tag.comment}</div>
                  </div>
                  {tag.verified && (
                    <span className="text-xs text-green-600">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Home Screen Component
  const HomeScreen = () => {
    const riskLevel = floodTags.length > 2 ? 'HIGH' : 'MODERATE';
    const riskColor = riskLevel === 'HIGH' ? 'text-red-600' : 'text-yellow-600';

    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">FloodAware GH</h1>
          <p className="opacity-90">Community-powered flood monitoring for Ghana</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Risk Level</h2>
            <span className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</span>
          </div>
          <div className="text-sm text-gray-600">
            {floodTags.length} active flood reports in your area
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentView('tag')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Droplets className="w-12 h-12 text-blue-500 mb-3 mx-auto" />
            <div className="font-semibold">Tag Flood Area</div>
            <div className="text-sm text-gray-600 mt-1">Report flooding</div>
          </button>

          <button
            onClick={() => setCurrentView('map')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Map className="w-12 h-12 text-green-500 mb-3 mx-auto" />
            <div className="font-semibold">View Flood Map</div>
            <div className="text-sm text-gray-600 mt-1">See risk areas</div>
          </button>

          <button
            onClick={() => alert('Alerts feature coming soon!')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <AlertTriangle className="w-12 h-12 text-yellow-500 mb-3 mx-auto" />
            <div className="font-semibold">My Area Alerts</div>
            <div className="text-sm text-gray-600 mt-1">Get warnings</div>
          </button>

          <button
            onClick={() => alert('Safety tips coming soon!')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <BookOpen className="w-12 h-12 text-purple-500 mb-3 mx-auto" />
            <div className="font-semibold">Safety Tips</div>
            <div className="text-sm text-gray-600 mt-1">Be prepared</div>
          </button>
        </div>
      </div>
    );
  };

  // Navigation Component
  const NavigationBar = () => {
    if (currentView === 'home') return null;

    return (
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          <h1 className="font-semibold">
            {currentView === 'tag' ? 'Tag Flood Area' : 'Flood Map'}
          </h1>
          <div className="w-20"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'tag' && <TagFloodArea />}
      {currentView === 'map' && <FloodMap />}
    </div>
  );
}
