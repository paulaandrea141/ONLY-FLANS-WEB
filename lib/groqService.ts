/**
 * GROQ IA SERVICE - Integración de Groq LLM (100% Gratuito)
 * Modelo: llama-3.3-70b-versatile
 * No requiere suscripción, usa API key gratuita
 */

export interface GroqResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface CandidatoAnalisis {
  score: number;
  etapa: 'Prospecto' | 'Calificado' | 'Asignado' | 'Inductado' | 'Contratado' | 'Rechazado';
  razon: string;
  vacanteSugerida?: string;
  recomendaciones: string[];
}

class GroqService {
  private apiKey: string;
  private apiBase = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama-3.3-70b-versatile';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ GROQ_API_KEY no está configurada');
    }
  }

  /**
   * Analiza un candidato usando IA
   */
  async analizarCandidato(
    nombre: string,
    edad: number,
    colonia: string,
    formacion: string,
    experiencia: string,
    vacantesDisponibles: string[]
  ): Promise<CandidatoAnalisis> {
    const prompt = `
Eres un experto en reclutamiento autónomo. Analiza este candidato y proporciona:

CANDIDATO:
- Nombre: ${nombre}
- Edad: ${edad} años
- Colonia: ${colonia}
- Formación: ${formacion}
- Experiencia: ${experiencia}

VACANTES DISPONIBLES: ${vacantesDisponibles.join(', ')}

Responde en JSON válido con EXACTAMENTE esta estructura (sin markdown):
{
  "score": <número 0-100>,
  "etapa": "<Prospecto|Calificado|Asignado|Inductado|Contratado|Rechazado>",
  "razon": "<explicación breve>",
  "vacanteSugerida": "<nombre vacante o null>",
  "recomendaciones": ["<recomendación 1>", "<recomendación 2>", "<recomendación 3>"]
}

INSTRUCCIONES CRÍTICAS:
1. Score: Califica 0-100 basado en compatibilidad general
2. Etapa: Determina la etapa en el embudo
3. Solo responde JSON, sin explicación adicional
4. Las recomendaciones deben ser acciones específicas
    `;

    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Limpia la respuesta de posibles etiquetas markdown
      const jsonStr = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const analisis = JSON.parse(jsonStr) as CandidatoAnalisis;

      return analisis;
    } catch (error) {
      console.error('Error analizando candidato con Groq:', error);
      return {
        score: 50,
        etapa: 'Prospecto',
        razon: 'Error en análisis. Clasificación por defecto.',
        recomendaciones: ['Revisar manualmente', 'Aumentar tiempo de análisis'],
      };
    }
  }

  /**
   * Genera mensaje personalizado para candidato
   */
  async generarMensajePersonalizado(
    nombre: string,
    puesto: string,
    salario: number
  ): Promise<string> {
    const prompt = `
Genera un mensaje de WhatsApp profesional y atractivo para un candidato.

Datos:
- Nombre: ${nombre}
- Puesto: ${puesto}
- Salario: $${salario.toLocaleString('es-MX')}

Requisitos:
1. Máximo 3 líneas
2. Tono profesional pero amigable
3. Incluir emoji relevantes
4. Terminar con call to action clara
5. Sin símbolos especiales que rompan WhatsApp
    `;

    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const mensaje = data.choices[0]?.message?.content || 'Hola, tenemos una oportunidad para ti.';

      return mensaje.trim();
    } catch (error) {
      console.error('Error generando mensaje:', error);
      return `Hola ${nombre}, tenemos la vacante de ${puesto} con salario $${salario.toLocaleString('es-MX')}. ¿Te interesa?`;
    }
  }

  /**
   * Analiza feedback de candidato
   */
  async analizarFeedback(feedback: string): Promise<{
    sentimiento: 'positivo' | 'neutral' | 'negativo';
    temas: string[];
    accion: string;
  }> {
    const prompt = `
Analiza este feedback de candidato:

"${feedback}"

Responde EXACTAMENTE en JSON:
{
  "sentimiento": "<positivo|neutral|negativo>",
  "temas": ["<tema1>", "<tema2>"],
  "accion": "<acción recomendada>"
}
    `;

    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error analizando feedback:', error);
      return {
        sentimiento: 'neutral',
        temas: ['general'],
        accion: 'Revisar manualmente',
      };
    }
  }
}

// Singleton
export const groqService = new GroqService();

export default groqService;
