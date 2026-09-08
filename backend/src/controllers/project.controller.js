import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

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
        throw new ApiError(400, "Only team leader can create the project")
    }

    const existingProject = await Project.findOne({ teamId });

    if(existingProject){
        throw new ApiError(400, "Project already exists")
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

    return res.status(200).json(new ApiResponse(200, "Project is created successfully"));

})

export { createProject };