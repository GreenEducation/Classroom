import { connectToDatabase } from "../../util/mongodb";
import { ObjectId } from 'mongodb'


export default async function handler(req, res) {
  
  const { db } = await connectToDatabase()
  const result = await db.collection("help_requests").insertOne(
    {
      course_id:      new ObjectId(req.body.course_id),
      module_id:      new ObjectId(req.body.module_id),
      activity_id:    new ObjectId(req.body.activity_id),
      student_id:     new ObjectId(req.body.student_id),
      message:        req.body.message,
      resolved:       req.body.resolved
    }
  )

  res.json(result)

}