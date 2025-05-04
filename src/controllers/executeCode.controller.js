import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";

export const executeCode = async (req, res, next) => {
    try {
        const { source_code, language_id, stdin, expected_output, problemId } = req.body

        const userId = req.user.id;

        // Validate test cases
        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_output) ||
            expected_output.length !== stdin.length
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
        const tokens = submitResponse.map(r => r.token);

        // 4. Poll judge0 for results of all submitted test cases
        const results = await pollBatchResults(tokens);

        console.log('results------------------', results);

        res.status(200).json(new ApiResponse(200, results, 'Code executed successfully'));
    } catch (error) {
        next(error)
    }
};