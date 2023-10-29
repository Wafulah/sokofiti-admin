import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';
import { getPosition } from './geolocationUtil';

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
    const position = await getPosition();

    if (position) {
      const { latitude, longitude } = position.coords;

      // Update the store with the latitude and longitude
      await prismadb.store.update({
        where: { id: storeId },
        data: {
          latitude:latitude,
          longitude:longitude,
        },
      });
    }
  }
}
