import { db } from '../libs/db.js';
import { getJudge0LanguageId, pollBatchResults, submitBatch } from '../libs/judge0.lib.js';
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';

export const createProblem = async (req, res, next) => {
  // 1. get all data from request body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  // 2. check user role is admin or not
  if (req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'You are not authorized to create a problem');
  }

  // 3. loop through each referance solution for diffrent language
  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      // 3.1 get judge0 language id
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
      }

      // 3.2 prepare judge0 submission for all testcases
      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      // 3.3 submit all testcases to judge0 and get tokens
      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((res) => res.token);

      // 3.4 poll judge0 for all testcases
      const results = await pollBatchResults(tokens);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log("Result----", result);

        if (result.status.id !== 3) {
          throw new ApiError(
            400,
            `Testcase ${i + 1} failed for language ${language}`,
          );
        }
      }

      // 3.5 save problem in database
      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
          userId: req.user.id,
        },
      });

      return res
        .status(201)
        .json(new ApiResponse(201, newProblem, 'Problem created successfully'));
    }
  } catch (error) {
    next(error);
  }
};

export const getAllProblems = async (req, res, next) => {
  try {
    const problems = await db.problem.findMany();
    if (!problems) {
      throw new ApiError(404, 'No problems found');
    }
    res.status(200).json(new ApiResponse(200, problems, 'Problems fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProblemById = async (req, res, next) => {
  const { id } = req.params
  try {
    const problem = await db.problem.findUnique({ where: { id } });
    if (!problem) {
      throw new ApiError(404, 'Problem not found');
    }
    res.status(200).json(new ApiResponse(200, problem, 'Problem fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProblem = async (req, res, next) => {
  // get all data from request body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;
  const problemId = req.params.id;

  // check user role is admin or not
  if (req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'You are not authorized to create a problem');
  }

  const problem = await db.problem.findUnique({
    where: { id: problemId },
  });
  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  // loop through each referance solution for diffrent language
  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      //  get judge0 language id
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
      }

      // prepare judge0 submission for all testcases
      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      //  submit all testcases to judge0 and get tokens
      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((res) => res.token);

      //  poll judge0 for all testcases
      const results = await pollBatchResults(tokens);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log("Result----", result);

        if (result.status.id !== 3) {
          throw new ApiError(
            400,
            `Testcase ${i + 1} failed for language ${language}`,
          );
        }
      }

      //  save problem in database
      const updateProblem = await db.problem.update({
        where: {
          id: problemId
        },
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
        },
      });

      return res
        .status(200)
        .json(new ApiResponse(200, updateProblem, 'Problem updated successfully'));
    }
  } catch (error) {
    next(error);
  }
};

export const deleteProblem = async (req, res, next) => {
  const { id } = req.params

  try {
    const problem = await db.problem.findUnique({ where: { id } });
    if (!problem) {
      throw new ApiError(404, 'Problem not found');
    }

    await db.problem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    })
  } catch (error) {
    console.log('deleteProblem error', error);

    next(error);
  }
};

export const getAllProblemsSolvedyUser = async (req, res, next) => { };
