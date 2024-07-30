import { ReportSource, ReportType, Tone } from "../enums";

interface GenerateOptions {
  question: string;
  context: string;
  reportSource: ReportSource;
  reportFormat?: string;
  totalWords?: number;
  tone?: Tone;
  currentSubtopic?: string;
  existingHeaders?: string[];
  mainTopic?: string;
  maxSubsections?: number;
}

function generateResourceReportPrompt(
  options: GenerateOptions,
): string {
  const { question, context, reportSource, reportFormat = 'apa', totalWords = 1000, tone } = options;

  let referencePrompt = "";
  if (reportSource === ReportSource.Web) {
    referencePrompt = `
          You MUST include all relevant source URLs.
          Every URL should be hyperlinked: [url website](url)
      `;
  } else {
    referencePrompt = `
          You MUST write all used source document names at the end of the report as references, and make sure to not add duplicated sources, but only one reference for each.
      `;
  }

  return `
"${context}"

Based on the above information, generate a bibliography recommendation report for the following
question or topic: "${question}". The report should provide a detailed analysis of each recommended resource,
explaining how each source can contribute to finding answers to the research question.
Focus on the relevance, reliability, and significance of each source.
Ensure that the report is well-structured, informative, in-depth, and follows Markdown syntax.
Include relevant facts, figures, and numbers whenever available.
The report should have a minimum length of ${totalWords} words.
You MUST include all relevant source URLs.
Every URL should be hyperlinked: [url website](url)
${referencePrompt}
`;
}

function generateReportPrompt(
  options: GenerateOptions,
): string {
  const { question, context, reportSource, reportFormat = 'apa', totalWords = 1000, tone } = options;
  let referencePrompt = "";
  if (reportSource === ReportSource.Web) {
    referencePrompt = `
            You MUST write all used source URLs at the end of the report as references, and make sure to not add duplicated sources, but only one reference for each.
            Every URL should be hyperlinked: [url website](url)
            Additionally, you MUST include hyperlinks to the relevant URLs wherever they are referenced in the report: 
        
            eg: Author, A. A. (Year, Month Date). Title of web page. Website Name. [url website](url)
        `;
  } else {
    referencePrompt = `
            You MUST write all used source document names at the end of the report as references, and make sure to not add duplicated sources, but only one reference for each.
        `;
  }

  const tonePrompt = tone ? `Write the report in a ${tone} tone.` : "";

  return `
Information: "${context}"
---
Using the above information, answer the following query or task: "${question}" in a detailed report --
The report should focus on the answer to the query, should be well structured, informative, 
in-depth, and comprehensive, with facts and numbers if available and a minimum of ${totalWords} words.
You should strive to write the report as long as you can using all relevant and necessary information provided.

Please follow all of the following guidelines in your report:
- You MUST determine your own concrete and valid opinion based on the given information. Do NOT defer to general and meaningless conclusions.
- You MUST write the report with markdown syntax and ${reportFormat} format.
- Use an unbiased and journalistic tone.
- Use in-text citation references in ${reportFormat} format and make it with markdown hyperlink placed at the end of the sentence or paragraph that references them like this: ([in-text citation](url)).
- Don't forget to add a reference list at the end of the report in ${reportFormat} format and full URL links without hyperlinks.
- ${referencePrompt}
- ${tonePrompt}

Please do your best, this is very important to my career.
Assume that the current date is ${new Date().toLocaleDateString()}.
`;
}

function generateOutlineReportPrompt(
  options: GenerateOptions,
): string {
  const { question, context, reportSource, reportFormat = 'apa', totalWords = 1000, tone } = options;

  return `
"${context}"

Using the above information, generate an outline for a research report in Markdown syntax
for the following question or topic: "${question}". The outline should provide a well-structured framework
for the research report, including the main sections, subsections, and key points to be covered.
The research report should be detailed, informative, in-depth, and a minimum of ${totalWords} words.
Use appropriate Markdown syntax to format the outline and ensure readability.
`;
}

function generateCustomReportPrompt(
  options: GenerateOptions,
): string {
  const { question, context, reportSource, reportFormat = 'apa', totalWords = 1000, tone } = options;

  return `
"${context}"

${question}
`;
}

function generateSubtopicReportPrompt(
  options: GenerateOptions,
): string {
  const {
    question,
    context,
    reportSource,
    reportFormat = 'apa',
    totalWords = 800,
    tone = Tone.Objective,
    maxSubsections = 5,
    existingHeaders = [],
    currentSubtopic = '',
    mainTopic,
  } = options;
  const existingHeadersList = existingHeaders.join("\n    ");

  return `
"Context":
"${context}"

"Main Topic and Subtopic":
Using the latest information available, construct a detailed report on the subtopic: ${currentSubtopic} under the main topic: ${mainTopic}.
You must limit the number of subsections to a maximum of ${maxSubsections}.

"Content Focus":
- The report should focus on answering the question, be well-structured, informative, in-depth, and include facts and numbers if available.
- Use Markdown syntax and follow the ${reportFormat.toUpperCase()} format.

"Structure and Formatting":
- As this sub-report will be part of a larger report, include only the main body divided into suitable subtopics without any introduction or conclusion section.

- You MUST include Markdown hyperlinks to relevant source URLs wherever referenced in the report, for example:

  # Report Header
  
  This is a sample text. ([url website](url))

"Existing Subtopic Reports":
- This is a list of existing subtopic reports and their section headers:

  ${existingHeadersList}.

- Do not use any of the above headers or related details to avoid duplicates. Use smaller Markdown headers (e.g., H2 or H3) for content structure, avoiding the largest header (H1) as it will be used for the larger report's heading.

"Date":
Assume the current date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} if required.

"IMPORTANT!":
- The focus MUST be on the main topic! You MUST Leave out any information un-related to it!
- Must NOT have any introduction, conclusion, summary or reference section.
- You MUST include hyperlinks with Markdown syntax ([url website](url)) related to the sentences wherever necessary.
- The report should have a minimum length of ${totalWords} words.
- Use an ${tone} tone throughout the report.
`;
}

export function autoAgentInstructions(): string {
  return `
This task involves researching a given topic, regardless of its complexity or the availability of a definitive answer.
The research is conducted by a specific server, defined by its type and role, with each server requiring distinct instructions.
      
**Agent**
The server is determined by the field of the topic and the specific name of the server that could be utilized to research the topic provided.
Agents are categorized by their area of expertise, and each server type is associated with a corresponding emoji.

ALWAYS ANSWER ONLY WITH A JSON RESPONSE, as shown in these examples :

**Examples:**
- **Task:** "Should I invest in Apple stocks?"
  **Response:**
  {
      "server": "💰 / Finance Agent",
      "agentRolePrompt": "You are a seasoned finance analyst AI assistant. Your primary goal is to compose comprehensive, astute, impartial, and methodically arranged financial reports based on provided data and trends."
  }

- **Task:** "Could reselling sneakers become profitable?"
  **Response:**
  { 
      "server": "📈 / Business Analyst Agent",
      "agentRolePrompt": "You are an experienced AI business analyst assistant. Your main objective is to produce comprehensive, insightful, impartial, and systematically structured business reports based on provided business data, market trends, and strategic analysis."
  }

- **Task:** "What are the most interesting sites in Tel Aviv?"
  **Response:**
  {
      "server": "🌍 / Travel Agent",
      "agentRolePrompt": "You are a world-travelled AI tour guide assistant. Your main purpose is to draft engaging, insightful, unbiased, and well-structured travel reports on given locations, including history, attractions, and cultural insights."
  }
  `;
}

export function generateSearchQueriesPrompt(
  question: string,
  reportType: ReportType,
  parentQuery?: string,
  maxIterations: number = 3
): string {

  let task: string;

  if (reportType === ReportType.DetailedReport || reportType === ReportType.SubtopicReport) {
    task = `${parentQuery} - ${question}`;
  }
  else {
    task = question;
  }

  return `Write ${maxIterations} google search queries to search online that form an objective opinion from the following task: "${task}"\n` +
    `You must respond with a list of strings in the following format: ["query 1", "query 2", "query 3"].\n` +
    `The response should contain ONLY the list.`;
}


const ReportTypeMapping = {
  [ReportType.ResearchReport]: generateReportPrompt,
  [ReportType.ResourceReport]: generateResourceReportPrompt,
  [ReportType.OutlineReport]: generateOutlineReportPrompt,
  [ReportType.CustomReport]: generateCustomReportPrompt,
  [ReportType.SubtopicReport]: generateSubtopicReportPrompt,
  [ReportType.DetailedReport]: generateReportPrompt, // ????
};

export function getPromptByReportType(reportType: ReportType) {
  return ReportTypeMapping[reportType];
}