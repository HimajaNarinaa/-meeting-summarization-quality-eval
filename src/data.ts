import qmsumSamples from "./qmsum-samples.json";

export type Evaluation = {
  id: string;
  title: string;
  team: string;
  date: string;
  duration: string;
  model: string;
  score: number | null;
  status: "Reviewed" | "In review" | "Needs attention" | "Dataset reference";
  raters: number | null;
  agreement: number | null;
  errors: string[];
  summary: string;
  dataset?: {
    name: "QMSum";
    domain: string;
    query: string;
    transcriptTurns: number;
    split: string;
    sourceUrl: string;
  };
};

export const evaluations: Evaluation[] = [
  {
    id: "EV-2048",
    title: "Q4 product launch planning",
    team: "Product",
    date: "Nov 14, 2026",
    duration: "48 min",
    model: "Summarizer v2.4",
    score: 4.6,
    status: "Reviewed",
    raters: 3,
    agreement: 0.92,
    errors: [],
    summary: "The team aligned on a December 8 launch, with Maya owning the release checklist and engineering completing the final QA pass by November 30. The open question is whether the onboarding email ships with the launch or in the following week.",
  },
  {
    id: "EV-2047",
    title: "Weekly engineering sync",
    team: "Engineering",
    date: "Nov 14, 2026",
    duration: "32 min",
    model: "Summarizer v2.4",
    score: 3.2,
    status: "Needs attention",
    raters: 3,
    agreement: 0.58,
    errors: ["Action item omitted", "Owner mismatch"],
    summary: "The team discussed API reliability and agreed to improve monitoring. Further investigation is needed before a timeline can be confirmed.",
  },
  {
    id: "EV-2046",
    title: "Customer research readout",
    team: "Research",
    date: "Nov 13, 2026",
    duration: "56 min",
    model: "Summarizer v2.4",
    score: 4.1,
    status: "Reviewed",
    raters: 4,
    agreement: 0.84,
    errors: ["Minor detail"],
    summary: "Across 12 interviews, customers consistently asked for a simpler first-run experience. The team will test a guided setup flow next week; Priya will synthesize the findings by Friday.",
  },
  {
    id: "EV-2045",
    title: "Growth experiments review",
    team: "Marketing",
    date: "Nov 13, 2026",
    duration: "41 min",
    model: "Summarizer v2.4",
    score: 3.8,
    status: "In review",
    raters: 2,
    agreement: 0.76,
    errors: ["Unsupported claim"],
    summary: "The referral experiment generated early interest but has not yet reached statistical significance. The team will keep it running through the end of the month before deciding whether to expand.",
  },
  {
    id: "EV-2044",
    title: "Design critique — workspace",
    team: "Design",
    date: "Nov 12, 2026",
    duration: "36 min",
    model: "Summarizer v2.4",
    score: 4.4,
    status: "Reviewed",
    raters: 3,
    agreement: 0.88,
    errors: [],
    summary: "The new workspace layout tested well, especially the reduced navigation. Alex will update the empty states by Tuesday, and the team will revisit keyboard accessibility in the next critique.",
  },
  {
    id: "EV-2043",
    title: "Partnerships pipeline check-in",
    team: "Sales",
    date: "Nov 12, 2026",
    duration: "29 min",
    model: "Summarizer v2.3",
    score: 2.9,
    status: "Needs attention",
    raters: 3,
    agreement: 0.51,
    errors: ["Decision invented", "Entity confusion"],
    summary: "The partnership is approved and the team will proceed with an integration this quarter.",
  },
];

export const qmsumExamples: Evaluation[] = qmsumSamples.map((sample) => ({
  id: sample.id,
  title: sample.topic,
  team: sample.domain,
  date: "QMSum test set",
  duration: `${sample.transcriptTurns} turns`,
  model: "Human reference",
  score: null,
  status: "Dataset reference",
  raters: null,
  agreement: null,
  errors: [],
  summary: sample.summary,
  dataset: {
    name: "QMSum",
    domain: sample.domain,
    query: sample.query,
    transcriptTurns: sample.transcriptTurns,
    split: sample.split,
    sourceUrl: sample.sourceUrl,
  },
}));

export const rubric = [
  { label: "Factual accuracy", detail: "Claims match what was said", score: 4.3, color: "mint" },
  { label: "Key information", detail: "Decisions and context included", score: 3.9, color: "blue" },
  { label: "Actionability", detail: "Owners and next steps are clear", score: 3.6, color: "purple" },
  { label: "Conciseness", detail: "Focused, without losing meaning", score: 4.2, color: "orange" },
];

export const errorBreakdown = [
  { label: "Omitted action item", count: 18, color: "rose" },
  { label: "Unsupported claim", count: 12, color: "orange" },
  { label: "Owner mismatch", count: 9, color: "purple" },
  { label: "Entity confusion", count: 6, color: "blue" },
];
