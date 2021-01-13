export const BlackList = {
  ids: []
};

interface limitList {
  ids: string[];
  tracks: {
    [key: string]: {
      name: string;
      album: string;
      artists: string;
      index: number | string;
    };
  };
}
function useBlackList(): string[] {
  function append() {}
  function read() {}

  return ["BlackList"];
}
