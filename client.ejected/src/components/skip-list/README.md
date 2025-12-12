feature(SKIP-LIST): expose ids of genres,and artists to a blocklist known as the skipList.

- The Skip List is checked as a new song starts.
- When the {id - name} matches an entry from Sets saved in the reducer, the action "/me/player/next" is triggered.
- A copy is kept in localStorage under the key prefix "skipList.", genres, artists, tracks, and active are the skipTypes.
-
