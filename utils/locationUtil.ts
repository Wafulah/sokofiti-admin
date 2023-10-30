import axios from 'axios';

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

import { useOrigin } from "@/hooks/use-origin"


export async function getLocationAndUpdateStore(storeId: string) {
  const { userId } = auth();
  

  if (!userId) {
    redirect('/sign-in');
    return;
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) {
    // Handle the case when the store doesn't exist.
    return;
  }

  if (!store.latitude || !store.longitude) {
    // If latitude or longitude is missing, get the user's location
    try {
        const response = await axios.get('/api/client-api/geolocation', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (response.status === 200) {
          const { latitude, longitude } = response.data;
          
            // Update the store with the latitude and longitude
            await prismadb.store.update({
              where: { id: storeId },
              data: {
                latitude:latitude,
                longitude:longitude,
              },
            });
          
          // Now you have the geolocation data from the client.
          console.log('Geolocation data obtained:', latitude, longitude);
    
          // Proceed to update the store or handle as needed.
        } else {
          console.error('Error obtaining geolocation data from the client. Status:', response.status);
        }
      } catch (error) {
        console.error('Error obtaining geolocation data from the client:', error);
      }

    
  }
}
