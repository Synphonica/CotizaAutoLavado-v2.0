"use client";
import { MapView } from "./MapView";
import { ServiceItem } from "./ServiceCard";

interface UnifiedMapViewProps {
  services: ServiceItem[];
  center?: { lat: number; lng: number };
  onServiceSelect?: (service: ServiceItem) => void;
  selectedService?: ServiceItem;
}

export function UnifiedMapView(props: UnifiedMapViewProps) {
  return <MapView {...props} />;
}
