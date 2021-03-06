import { ObjectId } from 'mongodb'
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import { connectToDatabase } from "../../util/mongodb"
import { pusher } from "../../util/pusher";


export default withApiAuthRequired( async function handler(req, res) {

  // TODO: update other collections and module progress
  const { db } = await connectToDatabase()
  const {matchedCount, modifiedCount} = await db.collection("student_activities").updateOne(
    { _id: new ObjectId(req.body.studentActId) },
    { $set: { status: req.body.status } }
  )

  // trigger a new post event via pusher
  await pusher.trigger("activities", "activity-status", {
    studentActId: req.body.studentActId,
    status: req.body.status
  })

  /**
   * Get all the activities in this module
   * Check how many are completed
   * course profile id
   * module id
   */
  //Use aggregate
  /*
  const {matchedCount, modifiedCount} = await db.collection("course_profile").updateOne(
    {
      course_id: new ObjectId(req.body.id),
      student_id: new ObjectId(req.body.student_id),
      "modules.uid": new ObjectId(req.body.module_id)
    },
    { 
      $set: {
        "modules.$.percentage": 50
      }
    }
  )
  */

  res.json({matchedCount, modifiedCount})
})