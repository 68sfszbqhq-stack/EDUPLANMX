
export interface SchoolContext {
  schoolName: string;
  vision: string;
  communityGoals: string;
  infrastructure: string;
}

export interface MCCEMSMetadata {
  id: string;
  category: 'recurso' | 'area' | 'ambito';
  name: string;
  url: string;
  progresionesCount: number;
}

export interface SubjectContext {
  subjectId: string;
  subjectName: string;
  formativePurpose: string;
  curriculumContent: string;
  mccemsCategory: string;
}

export interface LessonPlan {
  title: string;
  date: string;
  subject: string;
  learningGoal: string;
  progression: string;
  sequence: {
    opening: string;
    development: string;
    closing: string;
  };
  evaluation: string;
  resources: string[];
  duration: string;
  mccemsAlignment: {
    documentUrl: string;
    validated: boolean;
  };
}

export type AppView = 'dashboard' | 'context' | 'generator' | 'plans';
