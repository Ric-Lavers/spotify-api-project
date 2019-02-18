// https://jvilk.com/MakeTypes/


export interface playlists {
  href: string;
  items?: (playlist)[] | null;
  limit: number;
  next?: number | null;
  offset: number;
  previous?: number | null;
  total: number;
}
export interface playlist {
  collaborative: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images?: (ImagesEntity)[] | null;
  name: string;
  owner: Owner;
  primary_color?: null;
  public: boolean;
  snapshot_id: string;
  tracks: Tracks;
  type: string;
  uri: string;
}
export interface ExternalUrls {
  spotify: string;
}
export interface ImagesEntity {
  height?: number | null;
  url: string;
  width?: number | null;
}
export interface Owner {
  display_name: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
}
export interface Tracks {
  href: string;
  total: number;
}
