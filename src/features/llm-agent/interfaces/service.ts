export interface IStoryAgentService {
  generateGuidedStory(prompt: string): Promise<string>;
}
