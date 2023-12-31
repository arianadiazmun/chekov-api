import { FieldValue } from "firebase-admin/firestore";
import db from "./dbConnect.js";

const coll = db.collection("tasks");
//Get all tasks
export async function getTasks(req, res) {
  const { uid } = req.params;
  //get all tasks by user:
  const tasks = await coll.where("uid", "==", uid).get(); //uid stands for user id
  //arranges tasks in an array:

  const taskArray = tasks.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.send(taskArray);
}

export async function addTask(req, res) {
  const { title, uid } = req.body;
  if (!title || !uid) {
    res.status(401).send({ succes: false, message: "Not a valid request" });
    return;
  }
  const newTask = {
    title,
    uid,
    done: false,
    createdAt: FieldValue.serverTimestamp(),
  };
  await coll.add(newTask);
  getTasks(req, res);
}

// update tasks
export async function updateTask(req, res) {
  const { uid } = req.params;
  const { done, id } = req.body;

  if (!uid) {
    res.status(401).send({ success: false, message: "Not a valid request" });
    return;
  }

  const updates = {
    done,
    updatedAt: FieldValue.serverTimestamp(),
  };

  await coll
    .doc(id)
    .update(updates)
    .catch((err) => {
      res.status(500).send({ message: err });
      return;
    });

  getTasks(req, res);
}

//DELETE TASKS

export async function deleteTask(req, res) {
  const { uid } = req.params;
  const { id } = req.body;

  if (!uid) {
    res.status(401).send({ success: false, message: "Not a valid request" });
    return;
  }

  const deleteDoc = {
    id,
  };

  await coll.doc(id).delete(deleteDoc);

  getTasks(req, res);
}
