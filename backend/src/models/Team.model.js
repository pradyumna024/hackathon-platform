import mongoose,{Schema} from "mongoose";

const teamSchema = new Schema({
    hackathonId: {
        type: Schema.Types.ObjectId,
        ref: "Hackathon",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            role: {
                type: String,
                enum: ["leader", "member"],
                default: "member"
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    invitations: [
        {
            inviterId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            inviteeId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            status: {
                type: String,
                enum: [
                    "pending",
                    "accepted",
                    "rejected",
                    "expired"
                ],
                default: "pending"
            },
            expiresAt: {
                type: Date
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {timestamps: true})

export const Team = mongoose.model("Team", teamSchema)