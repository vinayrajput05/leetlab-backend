import { db } from '../libs/db.js';
import { getJudge0LanguageId, submitBatch } from '../libs/judge0.lib.js';
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';

export const createProblem = async (req, res) => {
  // 1. get all data from request body
  const {
    title,
    description,
    defficulty,
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
          defficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
          user: req.user.id,
        },
      });

      return res
        .status(201)
        .json(new ApiResponse(201, newProblem, 'Problem created successfully'));
    }
  } catch (error) {}
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllProblemsSolvedyUser = async (req, res) => {};
