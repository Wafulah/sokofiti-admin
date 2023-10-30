"use client"
type Position = {
    coords: {
      latitude: number;
      longitude: number;
    };
  };

export function getPosition(): Promise<Position | null> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            console.error(error.message);
            resolve(null);
          }
        );
      } else {
        console.error('Geolocation is not supported by your browser.');
        resolve(null);
      }
    });
  }
  