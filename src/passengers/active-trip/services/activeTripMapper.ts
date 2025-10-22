// src/passengers/active-trip/services/activeTripMapper.ts
import type { ActiveTrip } from '../types';

export function mapTripResponseToActiveTrip(apiData: any): ActiveTrip {
  return {
    id: apiData.id,
    pickup: {
      address: apiData.pickup_address,
      coordinates: {
        latitude: parseFloat(apiData.pickup_latitude),
        longitude: parseFloat(apiData.pickup_longitude),
      },
    },
    destination: {
      address: apiData.destination_address,
      coordinates: {
        latitude: parseFloat(apiData.destination_latitude),
        longitude: parseFloat(apiData.destination_longitude),
      },
    },
    serviceType: {
      id: apiData.service_type?.id ?? apiData.service_type_id,
      name: apiData.service_type?.name ?? '',
    },
    status: apiData.status,
    estimatedFare: parseFloat(apiData.estimated_fare),
    passenger_max_fare: parseFloat(apiData.passenger_max_fare),
    driver: apiData.driver
      ? {
          id: apiData.driver.id,
          name: apiData.driver.name,
          phone: apiData.driver.phone,
          vehicle: apiData.driver.vehicle,
          rating: apiData.driver.rating_average ?? apiData.driver.rating,
          location: {
            latitude: parseFloat(apiData.driver.location_latitude),
            longitude: parseFloat(apiData.driver.location_longitude),
          },
        }
      : undefined,
  };
}
