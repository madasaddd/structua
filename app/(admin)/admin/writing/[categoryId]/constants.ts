export type FieldConfig = {
  key: string;
  label: string;
};

export type EssayStructure = {
  intro: FieldConfig[];
  body1: FieldConfig[];
  body2: FieldConfig[];
};

export const ESSAY_TYPES: Record<string, { label: string; structure: EssayStructure }> = {
  advantage_disadvantage: {
    label: "Advantage & Disadvantage",
    structure: {
      intro: [
        { key: "paraphrase", label: "Paraphrase the Prompt" },
        { key: "advantages", label: "State 2 Advantages" },
        { key: "disadvantages", label: "State 2 disadvantages" }
      ],
      body1: [
        { key: "state1", label: "State Advantage 1" },
        { key: "explain1", label: "Explain Advantage 1" },
        { key: "state2", label: "State Advantage 2" },
        { key: "explain2", label: "Explain Advantage 2" }
      ],
      body2: [
        { key: "state1", label: "State Disadvantage 1" },
        { key: "explain1", label: "Explain Disadvantage 1" },
        { key: "state2", label: "State Disadvantage 2" },
        { key: "explain2", label: "Explain Disadvantage 2" }
      ]
    }
  },
  problem_solution: {
    label: "Problem & Solution",
    structure: {
      intro: [
        { key: "paraphrase", label: "Paraphrase the Prompt" },
        { key: "problems", label: "State 2 Problems" },
        { key: "solutions", label: "State 2 Solutions" }
      ],
      body1: [
        { key: "state1", label: "State Problem 1" },
        { key: "explain1", label: "Explain Problem 1" },
        { key: "state2", label: "State Problem 2" },
        { key: "explain2", label: "Explain Problem 2" }
      ],
      body2: [
        { key: "state1", label: "State Solution 1" },
        { key: "explain1", label: "Explain Solution 1" },
        { key: "state2", label: "State Solution 2" },
        { key: "explain2", label: "Explain Solution 2" }
      ]
    }
  },
  double_question: {
    label: "Double Question",
    structure: {
      intro: [
        { key: "paraphrase", label: "Paraphrase the Prompt" },
        { key: "answer1", label: "Answer Question 1" },
        { key: "answer2", label: "Answer Question 2" }
      ],
      body1: [
        { key: "answer1", label: "Answer Question 1" },
        { key: "explain1", label: "Explain Answer for Question 1" },
        { key: "further1", label: "Explain Further Answer for Question 1" },
        { key: "example1", label: "Example of Answer for Question 1" }
      ],
      body2: [
        { key: "answer2", label: "Answer Question 2" },
        { key: "explain2", label: "Explain Answer for Question 2" },
        { key: "further2", label: "Explain Further Answer for Question 2" },
        { key: "example2", label: "Example of Answer for Question 2" }
      ]
    }
  },
  opinion: {
    label: "Opinion",
    structure: {
      intro: [
        { key: "paraphrase", label: "Paraphrase the Prompt" },
        { key: "mainIdea1", label: "Write Main Idea 1" },
        { key: "mainIdea2", label: "Write Main Idea 2" }
      ],
      body1: [
        { key: "state1", label: "State Main Idea 1" },
        { key: "explain1", label: "Explain Main Idea 1" },
        { key: "further1", label: "Explain Further Main Idea 1" },
        { key: "example1", label: "Example of Main Idea 1" }
      ],
      body2: [
        { key: "state2", label: "State Main Idea 2" },
        { key: "explain2", label: "Explain Main Idea 2" },
        { key: "further2", label: "Explain Further Main Idea 2" },
        { key: "example2", label: "Example of Main Idea 2" }
      ]
    }
  },
  discuss_both_views: {
    label: "Discuss Both Views",
    structure: {
      intro: [
        { key: "paraphrase", label: "Paraphrase the Prompt" },
        { key: "viewpoint1", label: "Outline Viewpoint 1 (Negative)" },
        { key: "viewpoint2", label: "Outline Viewpoint 2 (Positive)" }
      ],
      body1: [
        { key: "state1", label: "State Viewpoint 1 (Negative)" },
        { key: "explain1", label: "Explain Viewpoint 1 (Negative)" },
        { key: "example1", label: "Example Viewpoint 1 (Negative)" },
        { key: "disagree", label: "State that you're disagree" }
      ],
      body2: [
        { key: "state2", label: "State Viewpoint 2 (Positive)" },
        { key: "explain2", label: "Explain Viewpoint 2 (Positive)" },
        { key: "example2", label: "Example Viewpoint 2 (Positive)" },
        { key: "agree", label: "State that you're agree" }
      ]
    }
  }
};
