import cron from "node-cron";
import Module from "../schema/module.js";

const everyMinuteCron = "* * * * *";
const midnightCron = "0 0 * * *";

export const resetExercisesCron = () => {
  cron.schedule(
    midnightCron,
    async () => {
      console.log("Reset exercises starting...");

      try {
        await Module.updateMany(
          {},
          {
            $set: {
              progress: 0,
              "exercises.$[].completed": false,
            },
          },
        );

        const daysArr = ["sun", "mon", "tues", "wed", "thur", "fri", "sat"];
        const todayKey = daysArr[new Date().getDay()];

        await Module.updateMany(
          {
            [`days.${todayKey}`]: true,
            "exercises.altActive": { $exists: true },
          },
          [
            {
              $set: {
                exercises: {
                  $map: {
                    input: "$exercises",
                    as: "ex",
                    in: {
                      $mergeObjects: [
                        "$$ex",
                        {
                          altActive: {
                            $cond: [{ $eq: [{ $type: "$$ex.altActive" }, "missing"] }, "$$REMOVE", { $not: "$$ex.altActive" }],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          ],
          { updatePipeline: true },
        );

        console.log("Reset exercises complete!");
      } catch (err) {
        console.log("Reset exercises failed");
        console.log(err);
      }
    },
    {
      timezone: "America/New_York",
    },
  );
};
