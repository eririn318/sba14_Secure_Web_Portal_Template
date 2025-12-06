const express = require('express')
const Project= require("../models/Project")
const Task = require("../models/Task")
const {authMiddleware} = require('../middlewares/auth')

const taskRouter=express.Router()

// protects all route in this router
taskRouter.use(authMiddleware)

// GET http://localhost:4000/api/projects/6930c3b9b677d4532c263c0f/tasks
// GET /api/projects/:projectId/tasks
// taskRouter.get('/:projectId/tasks', async(req, res) =>{
//     // try{
//     //     //to filter the project
//     //     const userProjects = await Project.find({user: req.user._id})
//     //     res.json(userProjects)
//     // }catch(error){
//     //     console.error(error)
//     //     res.status(500).json({error: error.message})
//     // }
//     // res.send('sending a;; projects.....')
//     res.json({message: "success"})
// })

// GET task by projectid
// GET /api/projects/:projectId/tasks
taskRouter.get('/:projectId/tasks', async(req, res) =>{
    try{
        const {projectId} = req.params
        // const project = await Project.findById(req.params.projectId)
        const project = await Project.findById(projectId)

        if(!project){
    return res
    .status(404)
    .json({message: `Project with id: ${projectId} not found!`})
}
//Authorization
    console.log(req.user._id)
    console.log(project.user)

        if(project.user.toString() !== req.user._id){
            return res.status(403).json({message: "User is not authorized"})
        }
        //  project: = from Task project{ObjectId}   
        const tasks = await Task.find({project:projectId})
        res.json(tasks)

    }catch(error){
        console.error(error)
        res.status(500).json({error: error.message})
    }
})


// POST /api/projects/:projectId/tasks
// in server.tsx path is the original taking here and add /:projectId/tasks
taskRouter.post('/:projectId/tasks', async(req, res) =>{
    try{
        // we are getting the projectId
        const {projectId}  = req.params
        // Authorization-check if project exist
        const project=await Project.findById(projectId)
        if(!project) return res.status(404).json({message:"Project not found"})

        // check if project belongs to user
        // project=projectId .user
        if(project.user.toString() !== req.user._id.toString()){
            return res.status(403).json({message:"Not authorized"})
        }

        const task = await Task.create({
            // copy from previous body(title & description & status)
            // whatever writing in body in postman
            ...req.body,
            //belongs to project id
            project:projectId
        })
        // responding to 201 created task
       res.status(201).json(task)

    }catch(error){
        console.error(error)
        res.status(500).json({error: error.message})
    }
  
})

// Helper function for PUT & DELETE
async function verifyTaskOwnership(taskId, userId){
    const task = await Task.findById(taskId)
    if(!task) return {error: "Task not found"}

        // find parent project(projectId for taskId)
        const project = await Project.findById(task.project)
        // if not fond -> error
        if(!project) return {error:"Parent project not found"}

        // if user is whether login or not
        // project.user=(if user of project) is not userId
        if(project.user.toString() !== userId.toString()){
            return {error: "Not authorized"}
        }
        // const task , const project
        // returning taskId, projectId
        return {task, project}
}


// PUT /tasks/:taskId 
taskRouter.put('/tasks/:taskId', async(req, res) =>{
    try {
        // params means from url
        // req.params->finding (//localhost4000/project/123), params =123
        const {taskId} = req.params
        // whatever you get error, it will be store in error
        const {error} = await verifyTaskOwnership(taskId, req.user._id)

        // if error "Not authorize->403, other error->404" .json is any error (message:error)/display json format in postman
        if(error) return res.status(error==="Not authorized" ? 403: 404).json({message:error})

        // finding id and body(name & description)
        // MongoDB id->body (in order/req.params.projectId, req.body)
        const updateTask = await Task.findByIdAndUpdate(taskId,req.body, {new: true})
        res.json(updateTask)
    
    }catch(error){
        res.status(500).json({error:error.message});
    }
})

// DELETE /tasks/:taskId
taskRouter.delete('/tasks/:taskId', async(req, res) =>{
        try {      
        const {taskId} = req.params
        const {error, task} = await verifyTaskOwnership(taskId, req.user._id)
        if(error) return res.status(error==="Not authorized" ? 403: 404).json({message:error})

          await Task.findByIdAndDelete(taskId);
          res.json({ message: "Tasks deleted!" });

        } catch (error) {
          res.status(500).json({error:error.message});
        }
      });


module.exports =  taskRouter

// POST http://localhost:4000/api/users to create user
// {
//     "username": "eriko",
//     "email": "eriko@gmail.com",
//     "password": "password"
// }


// POST http://localhost:4000/api/users/login to login to user
// copy & paste token in authorization tab
// (You can POST,PUT, DELETE from this logged in user only)


// GET http://localhost:4000/api/projects to see what's in projects file in MongoDB/ or postman->[](empty) 
// create project with this user--(You can POST,PUT, DELETE from this logged in user only)


// POST http://localhost:4000/api/projects TO CREATE PROJECT 
// {
//     "name": "First Project",
//     "description": "Project details..."
// }


// GET http://localhost:4000/api/projects/6930c3b9b677d4532c263c0f to get project by id
// copy&pase id from (in project file->_id: ObjectId("6930c3b9b677d4532c263c0f"))



// PUT http://localhost:4000/api/projects/6930c345da346369b64870bb to change data
// {
//     "name": "First Project changed",
//     "description": "Project details changed..."
// }



// DELETE http://localhost:4000/api/projects/6930c345da346369b64870bb delete by id

// GET http://localhost:4000/api/projects/6930c3b9b677d4532c263c0f/tasks (tasks)




// Task Routes: Create taskRoutes.js.
// Nested & Secure: The key here is that tasks are children of projects. This relationship must be reflected in your routes and your security model.
// Full CRUD for Tasks:
// POST /api/projects/:projectId/tasks: Create a new task for a specific project. Before creating the task, you must verify that the logged-in user owns the project specified by :projectId.
// GET /api/projects/:projectId/tasks: Get all tasks for a specific project. This also requires an ownership check on the parent project.
// PUT /api/tasks/:taskId: Update a single task. This is the most complex authorization check. You must:
// Find the task by :taskId.
// From the task, find its parent project.
// Verify that the logged-in user owns that parent project.
// DELETE /api/tasks/:taskId: Delete a single task. This requires the same complex authorization check as the update route.



// ========task=========


// POST http://localhost:4000/api/projects/6932759ae21ed86516880b93/tasks to create task (projectId)
// {  "title": "4th Project task",
//     "description": "4th Project task details..."
//     }


// GET http://localhost:4000/api/projects/6930c3b9b677d4532c263c0f/tasks (projectId) to get taskId


// PUT http://localhost:4000/api/projects/tasks/6933bd2729ca2c9f02f1f427 (taskId) to change task
// {      
//     "title": "tasks for 1st project changed",
//     "description": "tasks for 1st project changed"
//    }

// DELETE http://localhost:4000/api/projects/tasks/6933bd2729ca2c9f02f1f427 (taskId) to delete task