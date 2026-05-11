import { Target, Layers3, Trophy, FileText, Workflow } from "lucide-react";

export type TutorialKey = "okrs" | "board" | "prioritization" | "prd" | "journey";

export interface TutorialData {
  id: TutorialKey;
  title: string;
  icon: any;
  description: string;
  steps: {
    title: string;
    content: string;
  }[];
}

export const TUTORIALS: Record<TutorialKey, TutorialData> = {
  okrs: {
    id: "okrs",
    title: "How to use OKRs",
    icon: Target,
    description: "OKRs (Objectives and Key Results) help you align your team's day-to-day work with your company's strategic goals.",
    steps: [
      {
        title: "1. Define an Objective",
        content: "An Objective is a qualitative, ambitious goal you want to achieve. For example: 'Expand into the European Market'."
      },
      {
        title: "2. Set Key Results",
        content: "Key Results are measurable outcomes that indicate whether you've achieved the Objective. For example: 'Acquire 10,000 active users in the EU'."
      },
      {
        title: "3. Link Features",
        content: "Once your OKR is set, you can link specific features from your Board directly to the OKR. This ensures every feature you build is driving a strategic goal."
      }
    ]
  },
  prioritization: {
    id: "prioritization",
    title: "Feature Prioritization (RICE)",
    icon: Trophy,
    description: "We use the RICE scoring model to objectively determine which features will have the biggest impact for the lowest effort.",
    steps: [
      {
        title: "R - Reach",
        content: "How many users will this feature affect within a given timeframe? Higher reach increases the score."
      },
      {
        title: "I - Impact",
        content: "How much will this feature move the needle when a user encounters it? (Massive = 3, High = 2, Medium = 1, Low = 0.5, Minimal = 0.25)."
      },
      {
        title: "C - Confidence",
        content: "How confident are you in your Reach and Impact estimates? (High = 100%, Medium = 80%, Low = 50%). If you're just guessing, lower the confidence."
      },
      {
        title: "E - Effort",
        content: "How much time will this take from all teams (Product, Design, Engineering)? More effort divides the score, bringing priority down."
      }
    ]
  },
  board: {
    id: "board",
    title: "Features Board Workflow",
    icon: Layers3,
    description: "The Features Board is where you manage the lifecycle of what your team is building, organized by Releases.",
    steps: [
      {
        title: "1. Add Features",
        content: "Click 'Add feature' to drop a new idea into a release column. You can also drag and drop features between releases."
      },
      {
        title: "2. Update Status",
        content: "Click on any feature card to open its details. Update its status (e.g., In Design, In Dev, Shipped) to track its progress."
      },
      {
        title: "3. Flag Dependencies",
        content: "Inside the feature details, you can add blockers. If a feature is blocked, it will automatically be flagged on your Dashboard so you know it needs attention."
      }
    ]
  },
  prd: {
    id: "prd",
    title: "AI PRD Generator",
    icon: FileText,
    description: "Writing Product Requirements Documents can take hours. Use the AI generator to instantly draft a structured PRD based on a simple prompt.",
    steps: [
      {
        title: "1. Select a Feature",
        content: "Choose an existing feature from your backlog that needs a PRD."
      },
      {
        title: "2. Provide Context",
        content: "Type in a brief description of what the feature should do, who it is for, and any specific requirements."
      },
      {
        title: "3. Generate & Refine",
        content: "Click Generate. The AI will output a fully formatted PRD including user stories, acceptance criteria, and out-of-scope items. You can then edit the text directly."
      }
    ]
  },
  journey: {
    id: "journey",
    title: "Journey Mapping",
    icon: Workflow,
    description: "Map out the user experience visually using the endless canvas.",
    steps: [
      {
        title: "1. Add Nodes",
        content: "Drag shapes from the left toolbar onto the canvas to represent screens, user actions, or decisions."
      },
      {
        title: "2. Connect Nodes",
        content: "Draw connections between nodes to map the flow. Select a connection to add labels or change its style."
      },
      {
        title: "3. Link Features",
        content: "You can link specific nodes directly to Features in your backlog to show exactly where a feature fits into the user journey."
      }
    ]
  }
};
