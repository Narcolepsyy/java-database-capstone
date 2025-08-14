// Chatbot Receptionist Service with OpenAI Integration through backend API
// This service acts as a virtual receptionist to guide patients

export class ChatbotReceptionist {
  constructor() {
    this.conversationHistory = [];
    this.availableSpecialties = [
      'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician',
      'Orthopedic', 'Gynecologist', 'Psychiatrist', 'Dentist',
      'Ophthalmologist', 'ENT Specialist', 'Urologist', 'Oncologist',
      'Gastroenterologist', 'General Physician'
    ];
    this.systemPrompt = this.createSystemPrompt();
    this.apiKeyConfigured = false;
    this.model = 'gpt-3.5-turbo';

    // Check backend OpenAI configuration on initialization
    this.checkOpenAIConfig();
  }

  createSystemPrompt() {
    return `You are a focused and professional virtual medical receptionist for a hospital booking system. Your role is strictly limited to:

1. Help patients describe medical symptoms clearly
2. Recommend appropriate medical specialties from this list: ${this.availableSpecialties.join(', ')}
3. Guide patients to book appointments with suitable doctors
4. Provide basic information about our medical services and specialties
5. Ask clarifying questions about symptoms when needed

Strict Guidelines:
- Only respond to questions related to medical appointments, symptoms, or our medical services
- Politely decline to answer any unrelated questions (politics, entertainment, personal questions, etc.)
- Never provide medical diagnoses - only suggest appropriate specialists
- If asked about non-medical topics, always redirect the conversation to booking appointments
- Keep responses concise, professional, and focused on the medical appointment system
- For urgent symptoms, advise immediate medical attention
- Focus solely on helping patients find the right specialist
- Use neutral, professional language

For unrelated questions, politely respond with:
"I'm here to help you find the right doctor for your medical needs. Could you please tell me about your symptoms or what kind of medical specialist you're looking for?"

Available specialties you can recommend:
${this.availableSpecialties.map(spec => `- ${spec}`).join('\n')}

Format your responses to be helpful for patients choosing the right doctor specialty.`;
  }

  async checkOpenAIConfig() {
    try {
      const response = await fetch('/api/openai/config');
      if (response.ok) {
        const config = await response.json();
        this.apiKeyConfigured = config.apiKeyConfigured;
        this.model = config.model || this.model;
        console.log('OpenAI config loaded:',
          this.apiKeyConfigured ? 'API key configured' : 'API key not configured');
      } else {
        console.error('Failed to load OpenAI config');
      }
    } catch (error) {
      console.error('Error checking OpenAI config:', error);
    }
  }

  async sendMessage(userMessage) {
    // Add user message to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    let response;

    if (this.apiKeyConfigured) {
      try {
        response = await this.getBackendResponse(userMessage);
      } catch (error) {
        console.error('Backend API error:', error);
        response = this.getFallbackResponse(userMessage);
      }
    } else {
      response = this.getFallbackResponse(userMessage);
    }

    // Add bot response to conversation history
    this.conversationHistory.push({
      role: 'assistant',
      content: response
    });

    return {
      message: response,
      recommendedSpecialties: this.extractSpecialties(response),
      timestamp: new Date().toISOString()
    };
  }

  async getBackendResponse(userMessage) {
    const requestBody = {
      message: userMessage,
      systemPrompt: this.systemPrompt,
      history: this.conversationHistory.slice(-10), // Send last 10 messages for context
    };

    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend API error: ${errorData.error || response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Backend processing error: ${data.error}`);
    }

    return data.message;
  }

  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // Greeting responses
    if (this.isGreeting(message)) {
      return "Hello! 👋 I'm your virtual medical receptionist. I'm here to help you find the right doctor for your health concerns. Please describe your symptoms or tell me what kind of medical help you need.";
    }

    // Emergency keywords
    if (this.isEmergency(message)) {
      return "⚠️ If you're experiencing a medical emergency, please call emergency services immediately or visit the nearest emergency room. For non-emergency symptoms, I can help you find the right specialist.";
    }

    // Symptom-based responses
    const specialty = this.analyzeSymptoms(message);
    if (specialty) {
      return `Based on your symptoms, I recommend consulting with a **${specialty}**. They specialize in treating conditions like yours. Would you like me to help you find available ${specialty} doctors in our system?`;
    }

    // General help response
    if (this.isAskingForHelp(message)) {
      return `I can help you find the right doctor! Here's what I can assist with:
      
🔍 **Describe your symptoms** - I'll recommend the best specialist
🏥 **Choose a specialty** - If you know what type of doctor you need
📅 **Find available doctors** - I'll show you doctors in your preferred specialty
❓ **Answer questions** - About our medical services

What would you like help with today?`;
    }

    // Default response
    return "I understand you have health concerns. To help you find the right doctor, could you please describe your symptoms in more detail? For example, are you experiencing pain, discomfort, or other specific symptoms?";
  }

  isGreeting(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => message.includes(greeting));
  }

  isEmergency(message) {
    const emergencyKeywords = [
      'emergency', 'urgent', 'chest pain', 'heart attack', 'stroke', 'bleeding heavily',
      'severe pain', 'can\'t breathe', 'unconscious', 'seizure', 'suicide'
    ];
    return emergencyKeywords.some(keyword => message.includes(keyword));
  }

  isAskingForHelp(message) {
    const helpKeywords = ['help', 'assist', 'guide', 'what can you do', 'how does this work'];
    return helpKeywords.some(keyword => message.includes(keyword));
  }

  analyzeSymptoms(message) {
    const symptomMap = {
      'Cardiologist': ['chest pain', 'heart', 'palpitations', 'blood pressure', 'cardiac'],
      'Dermatologist': ['skin', 'rash', 'acne', 'eczema', 'mole', 'itchy'],
      'Neurologist': ['headache', 'migraine', 'dizziness', 'seizure', 'memory'],
      'Orthopedic': ['back pain', 'joint', 'bone', 'fracture', 'knee', 'shoulder'],
      'Gynecologist': ['menstrual', 'pregnancy', 'pelvic', 'reproductive'],
      'Dentist': ['tooth', 'dental', 'gum', 'mouth', 'oral'],
      'Ophthalmologist': ['eye', 'vision', 'sight', 'blind'],
      'ENT Specialist': ['ear', 'nose', 'throat', 'hearing', 'sinus'],
      'Psychiatrist': ['depression', 'anxiety', 'mental', 'stress', 'mood'],
      'General Physician': ['fever', 'cold', 'flu', 'general', 'checkup']
    };

    for (const [specialty, keywords] of Object.entries(symptomMap)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return specialty;
      }
    }
    return null;
  }

  extractSpecialties(response) {
    const mentioned = [];
    this.availableSpecialties.forEach(specialty => {
      if (response.toLowerCase().includes(specialty.toLowerCase())) {
        mentioned.push(specialty);
      }
    });
    return mentioned;
  }

  clearConversation() {
    this.conversationHistory = [];
  }

  getConversationHistory() {
    return this.conversationHistory;
  }
}

export const chatbotReceptionist = new ChatbotReceptionist();
