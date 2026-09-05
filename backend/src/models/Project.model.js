import mongoose,{Schema} from "mongoose";

const projectSchema = new Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true,
        unique: true
    },
    hackathonId: {
        type: Schema.Types.ObjectId,
        ref: "Hackathon",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    problemStatement: {
        type: String,
        required: true
    },
    solution: {
        type: String,
        required: true
    },
    techStack: {
        type: [String],
        default: []
    },
    repositoryUrl: {
        type: String,
        required: true
    },
    demoUrl: {
        type: String,
        required: true
    },
},{ timestamps: true})

export const Project = mongoose.model("Project", projectSchema)