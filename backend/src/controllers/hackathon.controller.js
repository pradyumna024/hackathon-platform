import mongoose from "mongoose";
import { Hackathon } from "../models/hackathon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createHackathon = asyncHandler( async(req, res)=>{
    const {
        title,
        description,
        theme,
        rules,
        startTime,
        endTime,
        registrationDeadline,
        minTeamSize,
        maxTeamSize,
        judgingCriteria
    } = req.body;

    if( [title, description, theme, rules, startTime, endTime, registrationDeadline]
        .some((field)=> !field)
    ){
        throw new ApiError(400, "All fields are required");
    }

    if(!minTeamSize || !maxTeamSize){
        throw new ApiError(400, "Team size limits are required")
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const registrationEnd = new Date(registrationDeadline);

    if (
        isNaN(start.getTime()) ||
        isNaN(end.getTime()) ||
        isNaN(registrationEnd.getTime())
    ) {
        throw new ApiError(400, "Invalid date format");
    }

    if (registrationEnd >= start) {
        throw new ApiError(
            400,
            "Registration deadline must be before hackathon start time"
        );
    }

    if (start >= end) {
        throw new ApiError(
            400,
            "Hackathon end time must be after start time"
        );
    }

    if (minTeamSize < 1 || maxTeamSize < 1) {
        throw new ApiError(
            400,
            "Team size must be at least 1"
        );
    }

    if (minTeamSize > maxTeamSize) {
        throw new ApiError(
            400,
            "Minimum team size cannot exceed maximum team size"
        );
    }

    if (!Array.isArray(judgingCriteria) || judgingCriteria.length === 0) {
        throw new ApiError(
            400,
            "At least one judging criterion is required"
        );
    }

    for (const criteria of judgingCriteria) {
        if (!criteria.name || !criteria.maxScore || criteria.weight == null) {
            throw new ApiError(
                400,
                "Each judging criterion must contain name, maxScore and weight"
            );
        }

        if (criteria.maxScore < 1) {
            throw new ApiError(
                400,
                "Criterion maxScore must be at least 1"
            );
        }

        if (criteria.weight < 0) {
            throw new ApiError(
                400,
                "Criterion weight cannot be negative"
            );
        }
    }

    const totalWeight = judgingCriteria.reduce(
        (sum, criteria) => sum + Number(criteria.weight),
        0
    );

    if (totalWeight !== 100) {
        throw new ApiError(
            400,
            "Judging criteria weights must total 100"
        );
    }

    const hackathon = await Hackathon.create({
        organiserId : req.user._id,
        title,
        description,
        theme,
        rules,
        startTime,
        endTime,
        registrationDeadline,
        minTeamSize,
        maxTeamSize,
        judgingCriteria
    }
    )

    if (!hackathon) {
        throw new ApiError(
            500,
            "Something went wrong while creating hackathon"
        );
    }

    return res.status(201).json(new ApiResponse(201, hackathon, "Hackathon created successfully"))
})

const getHackathonById = asyncHandler( async(req, res)=>{
    const { hackathonId } = req.params;

    if(!hackathonId){
        throw new ApiError(400, "Hackathon id is required");
    }

    const hackathon = await Hackathon.findById(hackathonId)
            .populate("organiserId", "name email avatar");

    if(!hackathon){
        throw new ApiError(404, "Hackathon not found");
    }

    return res.status(200).json(new ApiResponse(200, hackathon, "Hackathon fetched successfully"))
})

const getAllHackathons = asyncHandler( async(req, res)=>{
    const hackathon = await Hackathon.find()
        .populate("organiserId", "name email avatar")
        .sort({ created: -1});

    return res.status(200).json(new ApiResponse(200, hackathon, "Hackathons fetched successfully"))
})

const updateHackathon = asyncHandler(async (req, res) => {
    const { hackathonId } = req.params;

    if (!hackathonId) {
        throw new ApiError(400, "Hackathon id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
        throw new ApiError(400, "Invalid hackathon id");
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
        throw new ApiError(404, "Hackathon not found");
    }

    if (hackathon.organiserId.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to update this hackathon"
        );
    }

    const {
        title,
        description,
        theme,
        rules,
        startTime,
        endTime,
        registrationDeadline,
        minTeamSize,
        maxTeamSize,
        judgingCriteria,
        status
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (theme !== undefined) updates.theme = theme;
    if (rules !== undefined) updates.rules = rules;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;

    if (registrationDeadline !== undefined) {
        updates.registrationDeadline = registrationDeadline;
    }

    if (minTeamSize !== undefined) {
        updates.minTeamSize = minTeamSize;
    }

    if (maxTeamSize !== undefined) {
        updates.maxTeamSize = maxTeamSize;
    }

    if (judgingCriteria !== undefined) {
        updates.judgingCriteria = judgingCriteria;
    }

    if (status !== undefined) {
        updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(
            400,
            "No valid fields provided for update"
        );
    }

    const finalStartTime =
        startTime !== undefined
            ? new Date(startTime)
            : hackathon.startTime;

    const finalEndTime =
        endTime !== undefined
            ? new Date(endTime)
            : hackathon.endTime;

    const finalRegistrationDeadline =
        registrationDeadline !== undefined
            ? new Date(registrationDeadline)
            : hackathon.registrationDeadline;

    const finalMinTeamSize =
        minTeamSize !== undefined
            ? minTeamSize
            : hackathon.minTeamSize;

    const finalMaxTeamSize =
        maxTeamSize !== undefined
            ? maxTeamSize
            : hackathon.maxTeamSize;

    if (
        isNaN(finalStartTime.getTime()) ||
        isNaN(finalEndTime.getTime()) ||
        isNaN(finalRegistrationDeadline.getTime())
    ) {
        throw new ApiError(400, "Invalid date format");
    }

    if (finalRegistrationDeadline >= finalStartTime) {
        throw new ApiError(
            400,
            "Registration deadline must be before hackathon start time"
        );
    }

    if (finalStartTime >= finalEndTime) {
        throw new ApiError(
            400,
            "Hackathon end time must be after start time"
        );
    }

    if (finalMinTeamSize < 1 || finalMaxTeamSize < 1) {
        throw new ApiError(
            400,
            "Team size must be at least 1"
        );
    }

    if (finalMinTeamSize > finalMaxTeamSize) {
        throw new ApiError(
            400,
            "Minimum team size cannot exceed maximum team size"
        );
    }

    const updatedHackathon =
        await Hackathon.findByIdAndUpdate(
            hackathonId,
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedHackathon,
                "Hackathon updated successfully"
            )
        );
});

const deleteHackathon = asyncHandler(async (req, res)=>{
    const { hackathonId } = req.params;

    if (!hackathonId) {
        throw new ApiError(400, "Hackathon id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
        throw new ApiError(400, "Invalid hackathon id");
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
        throw new ApiError(404, "Hackathon not found");
    }

    if (hackathon.organiserId.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to delete this hackathon"
        );
    }

    await Hackathon.findByIdAndDelete(hackathonId);

    return res.status(200).json(new ApiResponse(200 , {}, "Hackathon deleted Successfully"));
})

export {createHackathon, getHackathonById, getAllHackathons, updateHackathon, deleteHackathon}