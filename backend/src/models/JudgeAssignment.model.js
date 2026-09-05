import mongoose,{Schema} from "mongoose";

const judgeAssignmentSchema = new Schema({
    judgeId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    submissionId: {
        type: Schema.Types.ObjectId,
        ref: "Submission",
        required: true
    },
    hackathonId: {
        type: Schema.Types.ObjectId,
        ref: "Hackathon",
        required: true
    },
    status: {
        type: String,
        enum: ["assigned", "in_progress", "completed"],
        default: "assigned"
    }

},{timestamps: true})

judgeAssignmentSchema.index(
    { judgeId: 1, submissionId: 1 },
    { unique: true }
);

export const JudgeAssignment = mongoose.model("JudgeAssignment", judgeAssignmentSchema);