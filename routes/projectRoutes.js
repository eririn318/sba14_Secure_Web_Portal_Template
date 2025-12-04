const express = require('express')
const Project= require("../models/Project")
const {authMiddleware} = require('../middlewares/auth')

const projectRouter=express.Router()

// protects all route in this router
projectRouter.use(authMiddleware)

// GET http://localhost:4000/api/projects
// GET /api/projects
projectRouter.get('/', async(req, res) =>{
    try{
        //to filter the project
        const userProjects = await Project.find({user: req.user._id})
        res.json(userProjects)
    }catch(error){
        console.error(error)
        res.status(500).json({error: error.message})
    }
    // res.send('sending a;; projects.....')
})

// GET project by id
// GET /api/projects/projectId
projectRouter.get('/:projectId', async(req, res) =>{
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
projectRouter.post('/', async(req, res) =>{
    try{
        
        const newProject = await Project.create({
            ...req.body,
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
projectRouter.put('/:projectId', async(req, res) =>{
    try {
        const {projectId} = req.params
        // This needs an authorization check
        // find the project to update
        // const projectToUpdate = await Project.findById(req.params.id);
        const projectToUpdate = await Project.findById(projectId);
    
        // check if the current user is the owner of the note
        if (req.user._id !== projectToUpdate.user.toString()) {
          return res
            .status(403)
            .json({ message: "User is not authorized to update this project."});
        }
        
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
projectRouter.delete('/:projectId', async(req, res) =>{
        try {
          // only created by this user can delete 
          //find the note to delete by id
          const projectToDelete = await Project.findById(req.params.projectId)
      
          //Check if the current user is the owner of the note
          if(req.user._id !== projectToDelete.user.toString()){
              return res.status(403).json({message: 'User is not authorized to delete this project'})
          }
      
          // This needs an authorization check
          const project = await Project.findByIdAndDelete(req.params.projectId);
          if (!project) {
            return res.status(404).json({ message: "No project found with this id!" });
          }
      
          res.json({ message: "Project deleted!" });
        } catch (err) {
          res.status(500).json(err);
        }
      });


module.exports =  projectRouter

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

// POST /api/projects: Create a new project. The owner’s ID must be taken from the req.user object (provided by the auth middleware) and saved with the new project.
// GET /api/projects: Get all projects owned by the currently logged-in user.
// GET /api/projects/:id: Get a single project by its ID. This must be protected by an ownership check—a user can only get a project they own.
// PUT /api/projects/:id: Update a project. Also protected by an ownership check.
// DELETE /api/projects/:id: Delete a project. Also protected by an ownership check.