
/**
 * 
 * @param {Object} obj 
 * @param  {...string} args 
 */


 function walkTheTree(obj, ...args){
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

Object.prototype.wtt = function(...args){
  return walkTheTree(this, ...args)
}