import mongoose from "mongoose";
async function main() {
   await mongoose.connect(process.env.DB_CONNECTION)
}
export default main;
