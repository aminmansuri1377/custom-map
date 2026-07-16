/**
 * Default provider bundle — all free, no-key, no-credit-card services.
 *
 * Swap any of these by passing a different bundle to <MapProvider>.
 * The components only depend on the interfaces, never on the impls.
 */

import { NominatimGeocoder } from "./nominatim-geocoder";
import { OsrmRouter } from "./osrm-router";
import { PhotonGeocoder } from "./photon-geocoder";
import type { GeocoderProvider, ProviderBundle } from "./types";

export type { GeocoderProvider, RoutingProvider, ProviderBundle } from "./types";
export { PhotonGeocoder } from "./photon-geocoder";
export { NominatimGeocoder } from "./nominatim-geocoder";
export { OsrmRouter } from "./osrm-router";

/**
 * The composite default geocoder uses Photon for forward search
 * (better autocomplete) and falls back to Nominatim for reverse.
 */
class CompositeGeocoder implements GeocoderProvider {
  readonly id = "photon+nominatim";
  constructor(
    private readonly forward: PhotonGeocoder,
    private readonly reverse_: NominatimGeocoder,
  ) {}

  search = this.forward.search.bind(this.forward);
  reverse = this.reverse_.reverse.bind(this.reverse_);
}

export const defaultProviders: ProviderBundle = {
  geocoder: new CompositeGeocoder(new PhotonGeocoder(), new NominatimGeocoder()),
  router: new OsrmRouter(),
};

export function createDefaultProviders(): ProviderBundle {
  return {
    geocoder: new CompositeGeocoder(new PhotonGeocoder(), new NominatimGeocoder()),
    router: new OsrmRouter(),
  };
}
