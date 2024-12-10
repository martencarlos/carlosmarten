// constants.ts
export const DEFAULT_ROLES = {
  developer: { name: "Developer", rate: 85 },
  designer: { name: "Designer", rate: 75 },
  researcher: { name: "Researcher", rate: 65 },
  manager: { name: "Project Manager", rate: 95 },
};

export const DEFAULT_TASKS = [
  {
    id: 1,
    name: "Research",
    start: "2024-12-10",
    duration: 5,
    progress: 60,
    role: "researcher",
    hoursPerDay: 6,
  },
  {
    id: 2,
    name: "Design",
    start: "2024-12-15",
    duration: 7,
    progress: 30,
    role: "designer",
    hoursPerDay: 8,
  },
];

export const DEFAULT_NEW_TASK = {
  name: "",
  start: "",
  duration: "",
  role: "",
  hoursPerDay: 8,
};
