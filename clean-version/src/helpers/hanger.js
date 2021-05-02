import get from 'lodash/get'

/**
 * 
 * @param {Object} obj 
 * @param  {...string} args 
 */


function walkTheTree(obj, ...args) {
  let str = '(obj'

  args.forEach(a => {
    str = str + '["' + a + '"]'
  })
  str = str + ")"
  try {
    return eval(str)

  } catch (error) {
    return undefined
  }
}

export const reduceGenres = (items) => {
  return items
    .reduce((a, {
      genres
    }) => {
      genres.forEach(genre => {
        const index = a.findIndex(({
          name
        }) => name === genre)

        if (index === -1) {
          a.push({
            name: genre,
            count: 1
          })
        } else {
          a[index].count++
        }
      })
      return a
    }, [])
    .sort((a, b) => b.count - a.count)
}

export const getTopGenres = (genres) => {
  const topThree = []
  genres.forEach((g, i) => {
    if (i < 3 || (get(topThree, '[2].count') === g.count)) {
      topThree.push(g)
    }
  })

  return topThree
}




Object.prototype.wtt = function (...args) {
  return walkTheTree(this, ...args)
}