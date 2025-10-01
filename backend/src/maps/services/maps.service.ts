import { Injectable } from '@nestjs/common';
import { GeocodeQueryDto, ReverseGeocodeQueryDto, AutocompleteQueryDto, DistanceQueryDto } from '../dto/geocode.dto';

@Injectable()
export class MapsService {
  private apiKey = process.env.GOOGLE_MAPS_API_KEY as string;

  private async request<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Maps API error: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  async geocode(params: GeocodeQueryDto) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.address)}&key=${this.apiKey}`;
    return this.request<any>(url);
  }

  async reverseGeocode(params: ReverseGeocodeQueryDto) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${params.lat},${params.lng}&key=${this.apiKey}`;
    return this.request<any>(url);
  }

  async autocomplete(params: AutocompleteQueryDto) {
    const location = params.lat != null && params.lng != null ? `&location=${params.lat},${params.lng}` : '';
    const radius = params.radius != null ? `&radius=${params.radius}` : '';
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(params.input)}${location}${radius}&key=${this.apiKey}`;
    return this.request<any>(url);
  }

  async distance(params: DistanceQueryDto) {
    const origins = `${params.originLat},${params.originLng}`;
    const destinations = `${params.destLat},${params.destLng}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${this.apiKey}`;
    return this.request<any>(url);
  }
}
