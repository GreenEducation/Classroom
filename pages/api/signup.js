import { connectToDatabase } from "../../util/mongodb";

// TODO: make sure there isn't already an account with this email
export default async function handler(req, res) {
  
  const { db } = await connectToDatabase()
  const result = await db.collection("users").insertOne(
    {
      id: 0,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      school: req.body.school,
      profile: req.body.profile_pic,
      date_of_birth: new Date(req.body.date_of_birth),
      date_created: new Date(req.body.date_created),
      notifications: req.body.notifications,
      active_courses: req.body.active_course,
      archived_courses: req.body.archived_courses,
      account_type: req.body.account_type,
      deleted: req.body.deleted
    }
  )

  res.json(result)

}