export * from "./handlePlay";
export * from "./formatFeatures";

let LOGIN_URL;
if (process.env.REACT_APP_ENV === "PROD") {
  LOGIN_URL =
    process.env.REACT_APP_LOGIN_URL_PROD ||
    "https://serverless-1qy6p9wlj.vercel.app/api/login";
} else if (process.env.REACT_APP_ENV === "STAG") {
  LOGIN_URL =
    process.env.REACT_APP_LOGIN_URL_PROD ||
    "https://serverless-1qy6p9wlj.vercel.app/api/login";
} else {
  LOGIN_URL =
    process.env.REACT_APP_LOGIN_URL_DEV || "http://localhost:4000/login";
}

class SpotifyHelpers {
  static combineArtists = artists => artists.map(({ name }) => name).join(", ");
}

export const combineArtists = artists =>
  artists.map(({ name }) => name).join(", ");
class Utils {
  static scrollIntoView = elementId =>
    document.getElementById(elementId).scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  static scrollToTop = () =>
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  static ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static searchToObj = () => {
    const search = window.location.search;
    let obj = {};
    search
      .substr(1, search.length)
      .split("&")
      .forEach(i => {
        let [key, value] = i.split("=");
        obj[key] = value;
      });
    return obj;
  };
}

export { SpotifyHelpers, Utils, LOGIN_URL };
