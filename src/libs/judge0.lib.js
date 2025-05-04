import axios from 'axios';

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()] ?? null;
};
export const getJudge0LanguageName = (language_id) => {
  const languageMap = {
    71: 'PYTHON',
    62: 'JAVA',
    63: 'JAVASCRIPT',
  };
  return languageMap[language_id] || 'Unknown';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const submitBatch = async (submissions) => {
  try {
    const options = {
      baseURL: process.env.JUDGE0_API_URL,
      url: 'submissions/batch',
      method: 'post',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      data: { submissions },
    };
    const { data } = await axios.request(options);
    // console.log('submitBatch response', data);

    return data;
  } catch (error) {
    // console.log('submitBatch error', error.response.data);

    return null;
  }
};

export const pollBatchResults = async (tokens) => {
  while (true) {
    const options = {
      baseURL: process.env.JUDGE0_API_URL,
      url: 'submissions/batch',
      method: 'get',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      },
      params: {
        tokens: tokens.join(','),
        base64_encoded: false,
      },
    };
    const { data } = await axios.request(options);
    const results = data.submissions;

    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2,
    );
    if (isAllDone) return results;
    await sleep(1000);
  }
};
