import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Project } from "../models/Project.model";
import { Submission } from "../models/Submission.model";
import { Hackathon } from "../models/hackathon.model";

const submission = asyncHandler(async(req, res)=>{
    const { projectId } = req.body;

    if(!projectId){
        throw new ApiError(400, "Project id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new ApiError(400, "Invalid project id")
    }

    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404, "Project not found")
    }

    const team = await Team.findById(project.teamId)
    
    if(!team){
        throw new ApiError(404, "Team not found")
    }

    const member = team.members.find(
        (member)=>
            member.userId.toString() === req.user._id.toString()
    )

    if(!member){
        throw new ApiError(403, "User does not belong to this team")
    }

    if(member.role !== "leader"){
        throw new ApiError(403, "Only the leader can submit the project");
    }

    const existingSubmission = await Submission.findOne({
        projectId
    });

    if(existingSubmission){
        throw new ApiError(409, "Final submission already exists for this project");
    }

    const hackathon = await Hackathon.findById(project.hackathonId)

    if(!hackathon){
        throw new ApiError(404, "Hackathon not found");
    }

    if(new Date() > hackathon.endTime){
        throw new ApiError(400, "Cannot submit after the hackathon end time")
    }

    if (!["ongoing"].includes(hackathon.status)) {
        throw new ApiError(
            400,
            "Project can only be submitted while the hackathon is ongoing"
        );
    }

    const finalSubmission = await Submission.create({
        projectId: project._id,
        hackathonId: project.hackathonId,
        submittedBy: req.user._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                finalSubmission,
                "Project submitted successfully"
            )
        );
})

export { submission }