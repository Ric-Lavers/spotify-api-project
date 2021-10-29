export function createZScoreAggregate(
  partyBlendId,
  numberAudiofeatures,
  userAverages,
  direction,
  limit
) {
  //sort by their faviourite feature
  const { tempo, ...sortByKeys } = userAverages
  const sortKeys = Object.keys(sortByKeys)
    .sort((a, b) => {
      let aMean = userAverages[a].mean
      let bMean = userAverages[b].mean
      if (a === 'popularity') {
        aMean = aMean / 100
      }
      if (b === 'popularity') {
        bMean = bMean / 100
      }
      return bMean - aMean
    })
    .reduce((a, key) => {
      a[`zScores.${key}`] = 1
      return a
    }, {})

  return [
    { $match: { playlistId: partyBlendId } },
    {
      $addFields: {
        zScores: numberAudiofeatures.reduce((a, c) => {
          a[`${c}`] = {
            $round: [
              {
                $abs: {
                  $divide: [
                    {
                      $subtract: [`$audioFeatures.${c}`, userAverages[c].mean],
                    },
                    userAverages[c].std,
                  ],
                },
              },
              2,
            ],
          }
          return a
        }, {}),
      },
    },
    {
      $addFields: {
        zScores: {
          total: {
            $round: [
              {
                $divide: [
                  {
                    $add: numberAudiofeatures.map(
                      (feature) => `$zScores.${feature}`
                    ),
                  },
                  numberAudiofeatures.length,
                ],
              },
              1,
            ],
          },
        },
      },
    },
    {
      // $sort: sortKeys,
      $sort: { 'zScores.total': direction, ...sortKeys },
    },
    { $limit: limit },
  ]
}
