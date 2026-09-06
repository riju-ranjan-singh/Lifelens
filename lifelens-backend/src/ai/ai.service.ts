import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { TasksService } from '../tasks/tasks.service';
import { MemoryService } from '../memory/memory.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private tasksService: TasksService,
    private memoryService: MemoryService
  ) {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async processMessage(userId: string, message: string) {
    try {
      // Fetch user memories to provide context to the LLM
      const memories = await this.memoryService.findAllForUser(userId);
      const memoryContext = memories.length > 0 
        ? "Here are important things to remember about the user:\n" + memories.map(m => `- [${m.category}] ${m.content}`).join("\n")
        : "You currently have no saved memories about this user.";

      const response = await this.openai.chat.completions.create({
        model: 'google/gemini-pro',
        messages: [
          {
            role: 'system',
            content: `You are SAPPLE, an AI life companion, best friend, and productivity mentor. 
            You help users manage tasks, schedules, and emotional well-being.
            Be warm, supportive, and natural.
            
            ${memoryContext}

            If the user asks to create a task, you MUST use the createTask tool.
            If the user tells you something important about their goals, routines, preferences, or facts you should remember for the future, you MUST use the saveMemory tool.`
          },
          { role: 'user', content: message }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'createTask',
              description: 'Create a new task in the user\'s planner based on their message.',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'The main action or title of the task' },
                  category: { type: 'string', description: 'Category (Study, Work, Health, Personal, etc.)', enum: ['Study', 'Work', 'Health', 'Personal', 'Projects', 'Other'] },
                  priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                  duration: { type: 'number', description: 'Estimated duration in minutes' }
                },
                required: ['title', 'category', 'priority']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'saveMemory',
              description: 'Save important long-term information about the user.',
              parameters: {
                type: 'object',
                properties: {
                  category: { type: 'string', description: 'Type of memory', enum: ['preference', 'goal', 'routine', 'fact'] },
                  content: { type: 'string', description: 'The memory content to save (e.g., "Wants to learn Kotlin this month")' },
                  importance: { type: 'number', description: 'Importance from 1 to 5' }
                },
                required: ['category', 'content']
              }
            }
          }
        ],
        tool_choice: 'auto',
      });

      const messageResponse = response.choices[0].message;

      // Handle tool calls
      if (messageResponse.tool_calls && messageResponse.tool_calls.length > 0) {
        for (const toolCall of messageResponse.tool_calls) {
          if (toolCall.function.name === 'createTask') {
            const args = JSON.parse(toolCall.function.arguments);
            await this.tasksService.create(userId, {
              title: args.title,
              category: args.category,
              priority: args.priority,
              duration: args.duration || null,
              status: 'Pending',
            });
            return {
              text: `I've successfully created the task "${args.title}" for you!`,
              actionTaken: 'task_created'
            };
          }

          if (toolCall.function.name === 'saveMemory') {
            const args = JSON.parse(toolCall.function.arguments);
            await this.memoryService.create(userId, args.category, args.content, args.importance || 1);
            return {
              text: `Got it. I'll remember that for the future!`,
              actionTaken: 'memory_saved'
            };
          }
        }
      }

      // Normal text response
      return {
        text: messageResponse.content,
      };

    } catch (error) {
      console.error("AI Service Error:", error);
      throw new InternalServerErrorException("Failed to communicate with SAPPLE brain.");
    }
  }
}
