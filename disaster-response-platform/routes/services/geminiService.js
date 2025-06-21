const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logAction } = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Generates a response from Gemini given a prompt.
 */
async function generateText(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    logAction('Gemini response generated');
    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Gemini generation failed');
  }
}

/**
 * Verifies the credibility of a message using Gemini.
 */
async function verifyMessageContent(message) {
  const prompt = `
    Analyze the following report and determine if it is likely true, partially true, or false.
    Provide reasoning and a confidence level (Low, Medium, High).

    Report: "${message}"
  `;
  return await generateText(prompt);
}

module.exports = {
  generateText,
  verifyMessageContent,
};
