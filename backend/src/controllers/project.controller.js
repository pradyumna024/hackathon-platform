import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Project } from "../models/Project.model";

const createProject = asyncHandler(async(req, res)=>{
    const { teamId } = req.body;

    if(!teamId){
        throw new ApiError(400, "Team id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(teamId)){
        throw new ApiError(400, "Team id is Invalid");
    }

    const team = await Team.findById(teamId)

    if(!team){
        throw new ApiError(404, "Team not found");
    }

    const { title, description, problemStatement, solution, } = req.body;

    if([title,  description, problemStatement, solution, repositoryUrl, demoUrl]
        .some((field)=> !field)
    ){
        throw new ApiError(400, "All fields are required");
    }

    if(!Array.isArray(techStack) || techStack.length === 0){
        throw new ApiError(400, "Tech stack is required")
    }

    const member = team.members.find(
        (member)=>
            member.userId.toString() === req.user._id.toString()
    )

    if(!member){
        throw new ApiError(403, "User does not belong to this team")
    }

    if(member.role !== "leader"){
        throw new ApiError(400, "Only the team leader can create the project")
    }

    const existingProject = await Project.findOne({ teamId });

    if(existingProject){
        throw new ApiError(400, "Project already exists for this team")
    }

    const project = await Project.create({
        temaId,
        hackathonId: team.hackathonId,
        title,
        description,
        problemStatement,
        solution,
        techStack,
        repositoryUrl,
        demoUrl
    })

    return res.status(200).json(new ApiResponse(200, project, "Project created successfully"));

})

const getProjectByTeamId = asyncHandler(async(req, res)=>{
    const { teamId } = req.params;

    if(!teamId){
        throw new ApiError(400, "Team id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(teamId)){
        throw new ApiError(400, "Team id is Invalid");
    }

    const team = await Team.findOne(teamId)

    if(!team){
        throw new ApiError(404, "Team not found");
    }

    const project = await Project.findById({teamId})
        .populate("teamId", "name members")

    return res.status(200).json(new ApiResponse(200, project, "Project details are fetched"))
})

const updateProject = asyncHandler(async(req, res)=>{
    const {projectId} = req.params;

    if(!projectId){
        throw new ApiError(400, "Project id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new ApiError(400, "Project id is Invalid");
    }

    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404, "Project not found");
    }

    const team = await Project.findById(project.teamId)

    if(!team){
        throw new ApiError(404, "Team not found");
    }

    const member = team.members.find(
        (member)=>
            member.userId.toString() === req.user._id.toString()
    )

    if(!member){{
        throw new ApiError(400, "User does not belong to this team")
    }}

    if(member.role !== "leader"){
        throw new ApiError(400, "Only the team leader can create the project")
    }

    const {
        title,
        description,
        problemStatement,
        solution,
        techStack,
        repositoryUrl,
        demoUrl
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (problemStatement !== undefined) updates.problemStatement = problemStatement;
    if (solution !== undefined) updates.solution = solution;
    if (techStack !== undefined) updates.techStack = techStack;
    if (repositoryUrl !== undefined) updates.repositoryUrl = repositoryUrl;
    if (demoUrl !== undefined) updates.demoUrl = demoUrl;

    if (Object.keys(updates).length === 0) {
        throw new ApiError(
            400,
            "No valid fields provided for update"
        );
    }

    if (
        techStack !== undefined &&
        (!Array.isArray(techStack) || techStack.length === 0)
    ) {
        throw new ApiError(
            400,
            "Tech stack must be a non-empty array"
        );
    }

    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        {
            $set: updates
        },
        {
            new: true,
            runValidators: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedProject,
                "Project updated successfully"
            )
        );
})

export { createProject, getProjectByTeamId, updateProject };