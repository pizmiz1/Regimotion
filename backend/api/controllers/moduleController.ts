import { Request, Response } from "express";
import { ModuleDto } from "../../../shared/moduledto.js";
import { JsonDto } from "../../../shared/jsondto.js";
import Module from "../schema/module.js";
import { randomUUID } from "crypto";
import mongoose, { Types } from "mongoose";

export const post = async (req: Request<{}, {}, ModuleDto>, res: Response<JsonDto<ModuleDto>>) => {
  try {
    let newModule = new Module(req.body);

    newModule.userEmail = req.user!.email;

    const retModule = await newModule.save();

    const dto = retModule.toJSON();

    res.status(201).json({ data: dto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const patch = async (req: Request<{}, {}, ModuleDto>, res: Response<JsonDto<ModuleDto>>) => {
  try {
    let percentComplete;
    const totalCount = req.body.exercises.length;
    if (totalCount === 0) {
      percentComplete = 0;
    } else {
      const completedCount = req.body.exercises.filter((exercise) => exercise.completed === true).length;
      percentComplete = (completedCount / totalCount) * 100;
    }

    req.body.progress = percentComplete;

    if (req.body.exercises) {
      req.body.exercises = req.body.exercises.map((ex: any) => ({
        ...ex,
        _id: ex.id,
      }));
    }

    const updated = await Module.findByIdAndUpdate(req.body.id, req.body, { new: true });

    if (!updated) {
      res.status(404).json({ error: "Module not found" });
      return;
    }

    const dto = updated.toJSON();

    res.status(200).json({ data: dto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const get = async (req: Request, res: Response<JsonDto<ModuleDto[]>>) => {
  try {
    const id = req.query.id;

    if (id) {
      const module = await Module.findById(id);

      if (!module) {
        res.status(404).json({ error: "Module not found" });
        return;
      }

      const dto = module.toJSON();

      res.status(200).json({ data: [dto] });
    } else {
      const modules = await Module.find({ userEmail: req.user!.email });

      const dto = modules.map((module) => {
        return module.toJSON();
      });

      res.status(200).json({ data: dto });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteModule = async (req: Request, res: Response<JsonDto<any>>) => {
  try {
    const id = req.params.id;

    const deleted = await Module.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ error: "Module not found" });
      return;
    }

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const linkExercises = async (req: Request<{}, {}, string[]>, res: Response<JsonDto<ModuleDto[]>>) => {
  const session = await mongoose.startSession();

  const linkId = randomUUID();
  const exerciseIds = req.body;
  const exerciseObjectIds = exerciseIds.map((curr) => new Types.ObjectId(curr));

  let modules: ModuleDto[] = [];

  try {
    await session.withTransaction(async () => {
      const matchingModules = await Module.find({
        userEmail: req.user!.email,
        "exercises._id": { $in: exerciseObjectIds },
      })
        .select("exercises._id exercises.linkId")
        .session(session);

      const previousLinkIds = [
        ...new Set(
          matchingModules.flatMap((module) =>
            module.exercises
              .filter((exercise) => exerciseObjectIds.some((curr) => curr.equals(exercise.id)))
              .map((exercise) => exercise.linkId)
              .filter((id): id is string => Boolean(id)),
          ),
        ),
      ];

      if (previousLinkIds.length > 0) {
        await Module.updateMany(
          { userEmail: req.user!.email },
          { $unset: { "exercises.$[exercise].linkId": "" } },
          {
            arrayFilters: [{ "exercise.linkId": { $in: previousLinkIds } }],
            session,
          },
        );
      }

      await Module.updateMany(
        {
          userEmail: req.user!.email,
          "exercises._id": { $in: exerciseObjectIds },
        },
        { $set: { "exercises.$[exercise].linkId": linkId } },
        {
          arrayFilters: [{ "exercise._id": { $in: exerciseObjectIds } }],
          session,
        },
      );

      const updatedModules = await Module.find({
        userEmail: req.user!.email,
      }).session(session);

      modules = updatedModules.map((module) => module.toJSON());
    });

    res.status(200).json({ data: modules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await session.endSession();
  }
};

export const unlinkExercises = async (req: Request<{}, {}, string>, res: Response<JsonDto<ModuleDto[]>>) => {
  try {
    const exerciseObjectId = new Types.ObjectId(req.body);

    const matchingModules = await Module.find({
      userEmail: req.user!.email,
      "exercises._id": exerciseObjectId,
    }).select("exercises._id exercises.linkId");

    if (matchingModules.length === 0) {
      res.status(404).json({ error: "Modules not found" });
      return;
    }

    const linkIds = [
      ...new Set(
        matchingModules.flatMap((module) =>
          module.exercises
            .filter((exercise) => exerciseObjectId.equals(exercise.id))
            .map((exercise) => exercise.linkId)
            .filter((id): id is string => Boolean(id)),
        ),
      ),
    ];

    if (linkIds.length === 0) {
      res.status(404).json({ error: "Links not found" });
      return;
    }

    await Module.updateMany(
      { userEmail: req.user!.email },
      { $unset: { "exercises.$[exercise].linkId": "" } },
      { arrayFilters: [{ "exercise.linkId": { $in: linkIds } }] },
    );

    const modules = await Module.find({ userEmail: req.user!.email });
    const dto = modules.map((curr) => {
      return curr.toJSON();
    });

    res.status(200).json({ data: dto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
