import ollama from "ollama";

export class Message{
  message;
  proposal;
}

export class OllamaApi {
  messages;
  constructor(sys_prompt) {
    this.messages = [
      {
        role: "system",
        content: sys_prompt,
      },
    ];
  }

  async respond(message, model = "qwen3.5:9b") {
    try {
      this.messages.push({
        role: "user",
        content: message,
      });

      const response = await ollama.chat({
        model,
        messages: this.messages,
        think: false,
        options: {
          temperature: 1,
          presence_penalty: 1.5,
          top_k: 20,
          top_p: 0.95,
        },
      });
      const msgPayload = {
        error: null,
        name: "Cosmos",
        nameColor: "#adc2ff",
        content: response.message.content,
      };
      this.messages.push(response.message);
      return {
        error: null,
        name: "Cosmos",
        nameColor: "#adc2ff",
        content: response.message.content,
      };
    } catch (error) {
      return {
        error: error,
        name: "ERROR",
        nameColor: "#664353",
        content: "Uhm, I think something went wrong.",
      };
    }
  }
}
