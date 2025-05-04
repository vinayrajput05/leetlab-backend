import {
  getJudge0LanguageName,
  pollBatchResults,
  submitBatch,
} from '../libs/judge0.lib.js';
import { db } from '../libs/db.js';
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';

export const executeCode = async (req, res, next) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } =
      req.body;

    const userId = req.user.id;

    // Validate test cases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      throw new ApiError(400, 'Invalid or Missing test cases');
    }

    // 2. Prepare each test cases for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // 3. Send batch submission request to judge0
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((r) => r.token);

    // 4. Poll judge0 for results of all submitted test cases
    const results = await pollBatchResults(tokens);

    // console.log('results------------------', results);
    // Analyze test case resules
    let allPassed = true;
    const detailsResults = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;

      if (!passed) allPassed = false;

      // console.log(`START Testcase ${i + 1} ${passed ? 'passed' : 'failed'}`);
      // console.log(`Input: ${stdin[i]}`);
      // console.log(`Expected Output: ${expected_output}`);
      // console.log(`Actual Output: ${stdout}`);
      // console.log(`END Testcase ${i + 1} ------------------\n\n`);

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    // store submission
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getJudge0LanguageName(language_id),
        stdin: stdin.join('\n'),
        stdout: JSON.stringify(detailsResults.map((r) => r.stdout)),
        stderr: detailsResults.some((r) => r.stderr)
          ? JSON.stringify(detailsResults.map((r) => r.stderr))
          : null,
        compileOutput: detailsResults.some((r) => r.compile_output)
          ? JSON.stringify(detailsResults.map((r) => r.compile_output))
          : null,
        status: allPassed ? 'Accepted' : 'Wrong Answer',
        memory: detailsResults.some((r) => r.memory)
          ? JSON.stringify(detailsResults.map((r) => r.memory))
          : null,
        time: detailsResults.some((r) => r.time)
          ? JSON.stringify(detailsResults.map((r) => r.time))
          : null,
      },
    });

    // If all passed = true mark problem as solved for the current user
    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    // Save individual test case results using detailedResults
    const testCaseResults = detailsResults.map(
      ({ compile_output, ...rest }) => ({
        ...rest,
        submissionId: submission.id,
        compileOutput: compile_output,
      }),
    );

    await db.testCaseResult.createMany({ data: testCaseResults });

    //
    const submissionWithTestCase = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          submissionWithTestCase,
          'Code Executed Successfully!',
        ),
      );
  } catch (error) {
    console.log('executeCode error', error);

    next(error);
  }
};
