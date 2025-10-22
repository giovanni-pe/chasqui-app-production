// src/drivers/trip-requests/services/driverOffersService.ts
import { mqttService } from '@/lib/mqtt';
import type { User } from '@/auth/types';

/* ---------------- Tipos auxiliares ---------------- */
export interface LatLng {
  latitude:  number;
  longitude: number;
}

interface VehiclePayload {
  brand:         string;
  model:         string;
  license_plate: string;
  color:         string;
}

interface DriverOfferPayload {
  trip_id:   number;
  driver_id: number;
  price:     number;
  driver: {
    id:       number;
    name:     string;
    rating:   number;
    location: LatLng;
    vehicle:  VehiclePayload;
  };
}

/* ---------------- Función principal ---------------- */
export function publishDriverOffer(
  tripId:   number,
  price:    number,
  user:     User,
  location: LatLng,
): void {
  if (!user?.driver)      throw new Error('El usuario no tiene perfil de conductor.');
  if (!location)          throw new Error('Ubicación no disponible.');

  /* Normaliza sólo los campos requeridos */
  const v = user.driver.vehicle ?? ({} as any);

  const payload: DriverOfferPayload = {
    trip_id:   tripId,
    driver_id: Number(user.id),
    price:     Number(price),
    driver: {
      id:       Number(user.id),
      name:     user.name,
      rating:   user.rating_average ?? 5,
      location,                                     // ← posición en vivo
      vehicle: {
        brand:         v.brand         ?? '',
        model:         v.model         ?? '',
        license_plate: v.license_plate ?? '',
        color:         v.color         ?? '',
      },
    },
  };

  mqttService.publish(`chasqui/trip_offers/${tripId}`, payload);
}
