"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tone = exports.ReportSource = exports.ReportType = void 0;
var ReportType;
(function (ReportType) {
    ReportType["ResearchReport"] = "research_report";
    ReportType["ResourceReport"] = "resource_report";
    ReportType["OutlineReport"] = "outline_report";
    ReportType["CustomReport"] = "custom_report";
    ReportType["DetailedReport"] = "detailed_report";
    ReportType["SubtopicReport"] = "subtopic_report";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportSource;
(function (ReportSource) {
    ReportSource["Web"] = "web";
    ReportSource["Local"] = "local";
    ReportSource["LangChainDocuments"] = "langchain_documents";
    ReportSource["Sources"] = "sources";
})(ReportSource || (exports.ReportSource = ReportSource = {}));
var Tone;
(function (Tone) {
    Tone["Objective"] = "Objective (impartial and unbiased presentation of facts and findings)";
    Tone["Formal"] = "Formal (adheres to academic standards with sophisticated language and structure)";
    Tone["Analytical"] = "Analytical (critical evaluation and detailed examination of data and theories)";
    Tone["Persuasive"] = "Persuasive (convincing the audience of a particular viewpoint or argument)";
    Tone["Informative"] = "Informative (providing clear and comprehensive information on a topic)";
    Tone["Explanatory"] = "Explanatory (clarifying complex concepts and processes)";
    Tone["Descriptive"] = "Descriptive (detailed depiction of phenomena, experiments, or case studies)";
    Tone["Critical"] = "Critical (judging the validity and relevance of the research and its conclusions)";
    Tone["Comparative"] = "Comparative (juxtaposing different theories, data, or methods to highlight differences and similarities)";
    Tone["Speculative"] = "Speculative (exploring hypotheses and potential implications or future research directions)";
    Tone["Reflective"] = "Reflective (considering the research process and personal insights or experiences)";
    Tone["Narrative"] = "Narrative (telling a story to illustrate research findings or methodologies)";
    Tone["Humorous"] = "Humorous (light-hearted and engaging, usually to make the content more relatable)";
    Tone["Optimistic"] = "Optimistic (highlighting positive findings and potential benefits)";
    Tone["Pessimistic"] = "Pessimistic (focusing on limitations, challenges, or negative outcomes)";
})(Tone || (exports.Tone = Tone = {}));
