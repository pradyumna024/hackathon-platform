import mongoose,{Schema} from "mongoose";

const submissionSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        unique: true
    },
    hackathonId: {
        type: Schema.Types.ObjectId,
        ref: "Hackathon",
        required: true,
    },
    submittedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["submitted", "under_review", "evaluated"],
        default: "submitted"
    }

},{timestamps: true})

export const Submission = mongoose.model("Submission", submissionSchema)