import { serverFetch } from "./utils";

export const getUserPartyPlaylists = async user_id => {
  try {
    let data = await serverFetch(`playlists/user/${user_id}`);

    return data;
  } catch (error) {
    console.error(error.message);
    return [];
  }
};
