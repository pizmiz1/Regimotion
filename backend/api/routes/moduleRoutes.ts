import express from "express";
import { body, param, query, ValidationChain } from "express-validator";
import { authenticate } from "../middleware/authentication.js";
import { validate } from "../middleware/validation.js";
import { deleteModule, get, linkExercises, patch, post, unlinkExercises } from "../controllers/moduleController.js";

// Validators
const postPatchValidators: ValidationChain[] = [
  body("id")
    .optional()
    .isString()
    .withMessage("Id must be a string")
    .trim()
    .escape()
    .isLength({ min: 24, max: 24 })
    .withMessage("Id must be 24 characters"),
  body("name").isString().withMessage("Name must be a string").trim().escape(),
  body("icon").isString().withMessage("Icon must be a string").trim().escape(),
  body("days").isObject().withMessage("Days must be an object"),
  body("days.*").isBoolean().withMessage("Days data must be booleans"),
];

const getValidator: ValidationChain[] = [
  query("id")
    .optional()
    .isString()
    .withMessage("Id must be a string")
    .trim()
    .escape()
    .isLength({ min: 24, max: 24 })
    .withMessage("Id must be 24 characters"),
];

const deleteValidator: ValidationChain[] = [
  param("id")
    .optional()
    .isString()
    .withMessage("Id must be a string")
    .trim()
    .escape()
    .isLength({ min: 24, max: 24 })
    .withMessage("Id must be 24 characters"),
];

const linkExercisesValidators: ValidationChain[] = [
  body("exerciseIds").isArray({ min: 1 }).withMessage("exerciseIds must be a non-empty array"),
  body("exerciseIds.*").isMongoId().withMessage("Each exerciseId must be a valid MongoDB ID"),
];

const unlinkExerciseValidators: ValidationChain[] = [body("exerciseId").isMongoId().withMessage("exerciseId must be a valid MongoDB ID")];

// Routes
const moduleRoutes = express.Router();
const baseUrl = "/module";

moduleRoutes.route(baseUrl).post(authenticate, postPatchValidators, validate, post);
moduleRoutes.route(baseUrl).patch(authenticate, postPatchValidators, validate, patch);
moduleRoutes.route(baseUrl).get(authenticate, getValidator, validate, get);
moduleRoutes.route(baseUrl + "/:id").delete(authenticate, deleteValidator, validate, deleteModule);
moduleRoutes.route(baseUrl + "/linkExercises").post(authenticate, linkExercisesValidators, validate, linkExercises);
moduleRoutes.route(baseUrl + "/unlinkExercises").post(authenticate, unlinkExerciseValidators, validate, unlinkExercises);

export default moduleRoutes;
