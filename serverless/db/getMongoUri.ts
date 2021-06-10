require("dotenv").config();

export const getMongoUri = () => {
  let MONGO_URI;
  if (process.env.NODE_ENV === "development") {
    MONGO_URI = process.env.MONGO_URI_DEV;
  } else if (process.env.NODE_ENV === "staging") {
    MONGO_URI = process.env.MONGODB_URI_STG;
  } else {
    MONGO_URI = process.env.MONGODB_URI;
  }
  return MONGO_URI;
};
/*  
console.log(MONGO_URI)
//Mongo connection
mongoose.Promise = global.Promise
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const Track = mongoose.model("track", trackSchema)
// const Demo = mongoose.model("demo", demoSchema)
// const Group = mongoose.model("group", groupSchema)

export { Track }

*/
