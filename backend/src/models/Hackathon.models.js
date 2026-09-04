import mongoose,{Schema} from "mongoose";

const hackathonSchema = new Schema({
    organiserId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    theme: {
        type: String,
        required: true
    },
    rules: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    minTeamSize: {
        type: Number,
        required: true,
        min: 1
    },
    maxTeamSize: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: [
            "draft",
            "registration_open",
            "ongoing",
            "judging",
            "completed",
            "cancelled",
        ],
        default: "draft"
    },
    judgingCriteria: [
        {
            name: {
                type: String,
                required: true
            },
            description: {
                type: String,
                default: ""
            },
            maxScore: {
                type: Number,
                required: true,
                min: 1
            },
            weight: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ]
}, {timestamps: true})

export const Hackathon = mongoose.model("Hackathon", hackathonSchema)