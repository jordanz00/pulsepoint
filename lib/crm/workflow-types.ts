/** Nimble-style workflow board types */

export type WorkflowStage = {
  id: string;
  order: number;
  label: string;
  instructions?: string;
};

export type WorkflowField = {
  id: string;
  label: string;
  type: "text" | "date" | "select";
  options?: string[];
};

export type WorkflowStep = {
  id: string;
  order: number;
  type: string;
  label: string;
};

export type WorkflowFieldValues = Record<string, string>;
