'use client';

import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CountryData {
  _id: string;
  name: string;
  code: string;
  dancerCount: number;
}

interface WorldMapProps {
  countryData: CountryData[];
  className?: string;
}

export default function WorldMap({ countryData, className = '' }: WorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get max dancer count for color scaling
  const maxDancers = Math.max(...countryData.map(c => c.dancerCount), 1);

  // Create a map of country codes to dancer counts
  const countryDataMap = countryData.reduce((acc, country) => {
    acc[country.code] = country;
    return acc;
  }, {} as Record<string, CountryData>);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        
        mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 
          'pk.eyJ1IjoidGVzdCIsImEiOiJjbGdlNzVqdGMwNWI0M2ZuczVzaW5kZGNwIn0.aqzPGfcvhiRB8Sp9U6iGtQ';
        
        const map = new mapboxgl.default.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [0, 20],
          zoom: 1.5
        });

        map.on('load', () => {
          // Add countries source
          map.addSource('countries', {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1'
          });

          // Create color expression based on dancer data
          const colorExpression = [
            'case',
            ['has', ['get', 'iso_3166_1_alpha_2'], ['literal', countryDataMap]],
            [
              'interpolate',
              ['linear'],
              [
                '/',
                ['get', 'dancerCount', ['get', ['get', 'iso_3166_1_alpha_2'], ['literal', countryDataMap]]],
                maxDancers
              ],
              0, '#fef3c7',
              0.2, '#fbbf24',
              0.4, '#f59e0b',
              0.6, '#d97706',
              0.8, '#b45309',
              1, '#92400e'
            ],
            '#f9fafb'
          ] as any;

          // Add fill layer
          map.addLayer({
            id: 'countries',
            type: 'fill',
            source: 'countries',
            'source-layer': 'country_boundaries',
            layout: {},
            paint: {
              'fill-color': colorExpression,
              'fill-opacity': 0.8,
              'fill-outline-color': '#374151'
            }
          });

          // Add hover layer
          map.addLayer({
            id: 'countries-hover',
            type: 'line',
            source: 'countries',
            'source-layer': 'country_boundaries',
            layout: {},
            paint: {
              'line-color': '#1f2937',
              'line-width': 2,
              'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0
              ]
            }
          });

          setIsLoaded(true);
        });

        // Mouse events
        map.on('mousemove', 'countries', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const countryCode = feature.properties?.iso_3166_1_alpha_2;
            const countryInfo = countryDataMap[countryCode];
            
            if (countryInfo) {
              setHoveredCountry(countryInfo);
              setMousePosition({ x: e.point.x, y: e.point.y });
              
              map.setFeatureState(
                { source: 'countries', sourceLayer: 'country_boundaries', id: feature.id },
                { hover: true }
              );
            } else {
              setHoveredCountry(null);
            }
          }
        });

        map.on('mouseleave', 'countries', () => {
          setHoveredCountry(null);
          map.removeFeatureState({ source: 'countries', sourceLayer: 'country_boundaries' });
        });

        mapRef.current = map;
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [countryDataMap, maxDancers]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainerRef}
        className="h-96 w-full rounded-lg overflow-hidden bg-base-200"
        style={{ minHeight: '384px' }}
      />

      {/* Tooltip */}
      {hoveredCountry && (
        <div
          className="absolute z-10 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 50,
            transform: mousePosition.x > (typeof window !== 'undefined' ? window.innerWidth - 200 : 800) ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="font-semibold text-sm">{hoveredCountry.name}</div>
          <div className="text-xs text-base-content/70">
            {hoveredCountry.dancerCount} dancer{hoveredCountry.dancerCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-base-content/70">
          Countries by Dancer Count
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                <div
                  key={i}
                  className="w-4 h-4"
                  style={{
                    backgroundColor: intensity === 0 ? '#fef3c7' : 
                                   intensity === 0.2 ? '#fbbf24' :
                                   intensity === 0.4 ? '#f59e0b' :
                                   intensity === 0.6 ? '#d97706' :
                                   intensity === 0.8 ? '#b45309' : '#92400e'
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-base-content/60">
              1 → {maxDancers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 