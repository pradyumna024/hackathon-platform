import mongoose,{Schema} from "mongoose";

const evaluationSchema = new Schema({
    judgeAssignmentId: {
        type: Schema.Types.ObjectId,
        ref: "JudgeAssignment",
        required: true,
        unique: true
    },
    totalScore: {
        type: Number,
        required: true,
        min: 0
    },
    feedback: {
        type: String,
        default: ""
    },
    scores: [
        {
            criteriaId: {
                type: Schema.Types.ObjectId,
                required: true
            },

            score: {
                type: Number,
                required: true,
                min: 0
            },

            comment: {
                type: String,
                default: ""
            }
        }
    ]
}, {timestamps: true});

export const Evaluation = mongoose.model("Evaluation", evaluationSchema);