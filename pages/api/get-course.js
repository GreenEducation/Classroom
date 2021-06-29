import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'

export default async function handler(req, res) {
  const { db } = await connectToDatabase()
  const { course_id } = req.query

  // TODO: check course_id before passing into the db
  const data = await db.collection("courses").findOne({_id: new ObjectId(course_id)}, { projection: { modules: 1 } })
  
  // TODO: handle the case where a course is not found
  res.json(data)
}