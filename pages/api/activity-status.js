import { ObjectId } from 'mongodb'
import { connectToDatabase } from "../../util/mongodb"

export default async function handler(req, res) {

  const { db } = await connectToDatabase()
  const {matchedCount, modifiedCount} = await db.collection("student_activities").updateOne(
    { _id: new ObjectId(req.body.id) },
    { $set: { status: req.body.status } }
  )

  res.json({matchedCount, modifiedCount})
}