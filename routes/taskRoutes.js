const express = require('express')
const Project= require("../models/Project")
const {authMiddleware} = require('../middlewares/auth')

const taskRouter=express.Router()

// protects all route in this router
taskRouter.use(authMiddleware)

// GET http://localhost:4000/api/projects/6930c3b9b677d4532c263c0f/tasks
// GET /api/projects
taskRouter.get('/:projectId/tasks', async(req, res) =>{
    // try{
    //     //to filter the project
    //     const userProjects = await Project.find({user: req.user._id})
    //     res.json(userProjects)
    // }catch(error){
    //     console.error(error)
    //     res.status(500).json({error: error.message})
    // }
    // res.send('sending a;; projects.....')
    res.json({message: "success"})
})

// GET project by id
// GET /api/projects/projectId
taskRouter.get('/:projectId', async(req, res) =>{
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
        res.json(project)
    }catch(error){
        console.error(error)
        res.status(500).json({error: error.message})
    }
})


// POST /api/projects
taskRouter.post('/', async(req, res) =>{
    try{
        
        const newProject = await Project.create({
            // copy from previous body(name & description)
            ...req.body,
            // user id of the user who created
            user:req.user._id
        })

       res.status(201).json(newProject)

    }catch(error){
        console.error(error)
        res.status(500).json({error: error.message})
    }
    // res.send('sending a;; projects.....')
})

// PUT /api/projects/projectId
taskRouter.put('/:projectId', async(req, res) =>{
    try {
        // params means from url
        // req.params->finding (//localhost4000/project/123)
        const {projectId} = req.params.projectId
        // This needs an authorization check
        // find the Project to update
        // const projectToUpdate = await Project.findById(req.params.id);
        const projectToUpdate = await Project.findById(projectId);
        
        // if user id is not match, it will be error(403)
        // check if the current user is the owner of the note
        if (req.user._id !== projectToUpdate.user.toString()) {
          return res
            .status(403)
            .json({ message: "User is not authorized to update this project."});
        }
        
        // finding id and body(name & description)
        // MongoDB id->body (in order/req.params.projectId, req.body)
        const project = await Project.findByIdAndUpdate(req.params.projectId, req.body, {
              new: true,
        });
        // if id of project does not found, return 404
        if(!project) {
        //   return res.status(404).json({ message: "No project found with this id!" });
          return res.status(404).json({ message: `No project found with ${projectId}! `});
        }
        res.json(project);
    }catch(error){
        res.status(500).json(error);
    }
})


// DELETE /api/projects/projectId
taskRouter.delete('/:projectId', async(req, res) =>{
        try {
          // only created by this user can delete 
          //find the note to delete by id
          const projectToDelete = await Project.findById(req.params.projectId)
      
          //Check if the current user is the owner of the note
          if(req.user._id !== projectToDelete.user.toString()){
              return res.status(403).json({message: 'User is not authorized to delete this project'})
          }
      
        // This needs an authorization check
        // whatever passing on url(id)
          const project = await Project.findByIdAndDelete(req.params.projectId);
          if (!project) {
            return res.status(404).json({ message: "No project found with this id!" });
          }
          
          
          res.json({ message: "Project deleted!" });
        } catch (err) {
          res.status(500).json(err);
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
