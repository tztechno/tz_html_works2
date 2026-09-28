import proj4 from "proj4";

// Japan Plane Rectangular CS origins (zones I..XIX): [lat0, lon0]
const JPRCS_ORIGINS: [number, number][] = [
  [33, 129.5], [33, 131], [36, 132 + 1 / 6], [33, 133.5], [36, 134 + 1 / 3],
  [36, 136], [36, 137 + 1 / 6], [36, 138.5], [36, 139 + 5 / 6], [40, 140 + 5 / 6],
  [44, 140.25], [44, 142.25], [44, 144.25], [26, 142], [26, 127.5],
  [26, 124], [26, 131], [20, 136], [26, 154],
];

/** Built-in proj4 definitions for common DEM CRSs, so no network lookup is needed. */
function builtinDef(code: number): string | null {
  const grs80LL = "+proj=longlat +ellps=GRS80 +no_defs";
  if (code === 6668 || code === 4612) return grs80LL; // JGD2011 / JGD2000 geographic
  if (code === 4269) return "+proj=longlat +datum=NAD83 +no_defs";

  const tm = (i: number) => {
    const [lat0, lon0] = JPRCS_ORIGINS[i];
    return `+proj=tmerc +lat_0=${lat0} +lon_0=${lon0} +k=0.9999 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs`;
  };
  if (code >= 6669 && code <= 6687) return tm(code - 6669); // JGD2011 plane zones
  if (code >= 2443 && code <= 2461) return tm(code - 2443); // JGD2000 plane zones

  if (code >= 6688 && code <= 6692) // JGD2011 UTM 51N..55N
    return `+proj=utm +zone=${code - 6637} +ellps=GRS80 +units=m +no_defs`;
  if (code >= 32601 && code <= 32660)
    return `+proj=utm +zone=${code - 32600} +datum=WGS84 +units=m +no_defs`;
  if (code >= 32701 && code <= 32760)
    return `+proj=utm +zone=${code - 32700} +south +datum=WGS84 +units=m +no_defs`;
  if (code >= 26901 && code <= 26923)
    return `+proj=utm +zone=${code - 26900} +datum=NAD83 +units=m +no_defs`;
  return null;
}

/** Make sure proj4 knows "EPSG:<code>"; falls back to epsg.io for unknown codes. */
export async function ensureCrs(code: number): Promise<string> {
  const name = `EPSG:${code}`;
  if (proj4.defs(name)) return name;

  let def = builtinDef(code);
  if (!def) {
    try {
      const r = await fetch(`https://epsg.io/${code}.proj4`);
      if (r.ok) def = (await r.text()).trim();
    } catch {
      /* handled below */
    }
  }
  if (!def) throw new Error(`Unknown CRS ${name} (not built in and epsg.io lookup failed).`);
  proj4.defs(name, def);
  return name;
}

/** Extract the EPSG code from GeoTIFF geokeys. */
export function epsgFromGeoKeys(keys: Record<string, unknown>): number {
  const code = (keys.ProjectedCSTypeGeoKey ?? keys.GeographicTypeGeoKey) as number | undefined;
  if (!code) throw new Error("This GeoTIFF has no CRS, so it cannot be located on the map.");
  if (code === 32767) throw new Error("User-defined CRS is not supported. Please re-save with an EPSG code.");
  return code;
}
