const express = require('express')
const router = express.Router()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/analisis', async (req, res) => {
    try {
        const { nombreActividad, distancia, vatiosCliente, vatiosRnn, vatiosLstm, vatiosBilstm, cadencia, segmentos } = req.body
        
        const segmentosTexto = segmentos.map(s =>
            `- ${s.tipo.toUpperCase()} tramo ${s.tramo}: 
      Cliente: ${s.cliente}W | RNN mínimo: ${s.rnn}W (${s.cliente - s.rnn > 0 ? '+' : ''}${s.cliente - s.rnn}W) | LSTM estándar: ${s.lstm}W (${s.cliente - s.lstm > 0 ? '+' : ''}${s.cliente - s.lstm}W) | BiLSTM máximo: ${s.bilstm}W (${s.cliente - s.bilstm > 0 ? '+' : ''}${s.cliente - s.bilstm}W)`
        ).join('\n')

        const prompt = `Eres un entrenador ciclista profesional especializado en análisis de rendimiento, prevención de lesiones y planificación del entrenamiento.
Analiza los datos de esta actividad para:
1. Detectar patrones de fatiga, sobreentrenamiento o riesgo de lesión
2. Evaluar el estado de forma actual del ciclista
3. Establecer una línea base para la planificación futura del entrenamiento

Habla directamente al ciclista en segunda persona. Sé directo, técnico pero comprensible.

═══ DATOS DE LA ACTIVIDAD ═══
Nombre: ${nombreActividad}
Distancia: ${distancia} km
Potencia media real: ${vatiosCliente}W
Cadencia media: ${cadencia} rpm (óptima: 90-95 rpm)
Déficit de cadencia: ${Math.max(0, 90 - cadencia)} rpm

═══ COMPARATIVA CON NIVELES PROFESIONALES ═══
- Umbral mínimo (RNN): ${vatiosRnn}W → ${vatiosCliente > vatiosRnn ? `+${vatiosCliente - vatiosRnn}W por encima ✅` : `-${vatiosRnn - vatiosCliente}W por debajo ⚠️`}
- Nivel estándar (LSTM): ${vatiosLstm}W → ${vatiosCliente > vatiosLstm ? `+${vatiosCliente - vatiosLstm}W por encima ✅` : `-${vatiosLstm - vatiosCliente}W por debajo ⚠️`}
- Techo máximo (BiLSTM): ${vatiosBilstm}W → ${vatiosCliente > vatiosBilstm ? `+${vatiosCliente - vatiosBilstm}W por encima 🔥` : `-${vatiosBilstm - vatiosCliente}W de margen`}

═══ ANÁLISIS POR TRAMOS ═══
${segmentosTexto}

═══ INSTRUCCIONES ═══
Analiza los datos con visión predictiva y de planificación. Detecta:
- Caídas progresivas de potencia entre tramos similares (signo de fatiga acumulada)
- Sobresfuerzos en tramos iniciales que comprometen tramos posteriores
- Irregularidades en la cadencia que pueden derivar en lesiones musculares o tendinosas
- Si el ciclista está cerca de su forma óptima o en fase de construcción
- Riesgos de sobreentrenamiento o de no recuperación suficiente

ESTRUCTURA DEL INFORME (máximo 450 palabras):

📊 ESTADO DE FORMA ACTUAL
¿Está el ciclista cerca de su forma óptima, en construcción o en riesgo de sobreentrenamiento?
Compara sus vatios con los tres niveles de referencia profesional.

⚠️ SEÑALES DE ALERTA
Detecta patrones de fatiga, caídas de rendimiento entre tramos o irregularidades que puedan 
derivar en lesiones o sobreentrenamiento. Sé específico con los datos.

⛰️ ANÁLISIS DE TRAMOS CRÍTICOS
Analiza los tramos de subida más exigentes. ¿Hay sobresfuerzo en los primeros que arrastra 
fatiga a los siguientes? ¿La potencia cae progresivamente indicando agotamiento de glucógeno?

🔄 IMPACTO DE LA CADENCIA
Con ${cadencia} rpm de media, ¿qué riesgo musculoesquelético existe a corto y medio plazo?
¿Cómo afecta a la eficiencia metabólica y a la recuperación post-actividad?

🗓️ PLANIFICACIÓN RECOMENDADA
Basándote en estos datos proporciona:
- Estado de recuperación necesario antes de la próxima salida de intensidad
- Tipo de entrenamiento recomendado para la próxima semana
- Objetivos de potencia y cadencia para las próximas salidas
- Si el ciclista está en condiciones de afrontar un objetivo próximo o necesita más base

🎯 CONCLUSIÓN
Una frase directa que resuma el estado del ciclista y el camino a seguir.`


        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 500,
            temperature: 0.7
        })

        res.json({ analisis: completion.choices[0]?.message?.content })
    } catch (err) {
        console.error('Error Groq:', err)
        res.status(500).json({ error: 'Error al generar el análisis' })
    }
})

module.exports = router