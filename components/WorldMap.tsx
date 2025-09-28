'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';

// Declare Google Charts types
declare global {
  interface Window {
    google: any;
  }
}

interface CountryData {
  _id: string;
  name: string;
  code: string;
  dancerCount: number;
}

interface WorldMapProps {
  countryData?: CountryData[];
}

export default function WorldMap({ countryData = [] }: WorldMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Charts
    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        drawChart();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.onload = () => {
        window.google.charts.load('current', {
          packages: ['geochart']
        });
        window.google.charts.setOnLoadCallback(drawChart);
      };
      document.head.appendChild(script);
    };

    const drawChart = () => {
      if (!chartRef.current || !window.google) return;

      // Prepare data for Google Charts
      const chartData: (string | number)[][] = [['Country', 'Dancers']];
      
      // Add real country data
      countryData.forEach(country => {
        chartData.push([country.name, country.dancerCount]);
      });

      // If no data provided, show sample data
      if (countryData.length === 0) {
        chartData.push(['United States', 10]);
        chartData.push(['Spain', 10]);
      }

      const data = window.google.visualization.arrayToDataTable(chartData);

      // Calculate max dancers for better color scaling
      const maxDancers = countryData.length > 0 
        ? Math.max(...countryData.map(c => c.dancerCount))
        : 10;

      const options = {
        colorAxis: {
          minValue: 0,
          maxValue: maxDancers,
          colors: ['#e3f2fd', '#1976d2', '#0d47a1'] // Light blue to dark blue gradient
        },
        backgroundColor: '#f8fafc',
        datalessRegionColor: '#e2e8f0', // Light grey for countries without data
        defaultColor: '#e2e8f0',
        tooltip: {
          textStyle: {
            fontSize: 14,
            fontName: 'Arial'
          },
          trigger: 'focus'
        },
        legend: {
          textStyle: {
            fontSize: 12
          }
        },
        width: '100%',
        height: '100%'
      };

      const chart = new window.google.visualization.GeoChart(chartRef.current);
      chart.draw(data, options);
    };

    loadGoogleCharts();
  }, [countryData]); // Re-draw when countryData changes

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: '400px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#f8fafc'
      }} 
    />
  );
}
