const express = require('express')
const router = express.Router()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/analisis', async (req, res) => {
    try {
        const {
            nombreActividad, distancia, vatiosCliente, vatiosRnn, vatiosLstm, vatiosBilstm,
            cadencia, desviacionVatios, normalizedPower, variabilityIndex, picosDetectados,
            segmentos
        } = req.body

        const segmentosTexto = segmentos.map(s =>
            `· ${s.tipo.toUpperCase()} #${s.tramo} (${s.duracion_s}s, pendiente media ${s.pendiente}%): potencia media ${s.cliente}W, pico máximo ${s.pico_max}W, cadencia ${s.cadencia}rpm | referencia RNN ${s.rnn}W (${s.cliente - s.rnn > 0 ? '+' : ''}${s.cliente - s.rnn}W) · LSTM ${s.lstm}W (${s.cliente - s.lstm > 0 ? '+' : ''}${s.cliente - s.lstm}W) · BiLSTM ${s.bilstm}W (${s.cliente - s.bilstm > 0 ? '+' : ''}${s.cliente - s.bilstm}W)`
        ).join('\n')

        const prompt =`Responde en HTML básico usando <h3> para títulos de sección, <p> para párrafos y <strong> para datos importantes. No uses CSS ni clases externas, solo etiquetas HTML simples quiero que me respondas en español de españa :Eres un director deportivo de un equipo ciclista World Tour, sentado revisando el potenciómetro de tu corredor justo después del entrenamiento, pero este analisis es cognitivo es como si tuviera los datos a tiempo real y pudiera aplicarlo. No eres un chatbot genérico de fitness: eres un experto que lleva 20 años analizando datos de potencia de profesionales y sabes leer entre líneas lo que los números esconden — gestión del esfuerzo, errores tácticos, riesgo de pájara, fatiga neuromuscular, ineficiencia de pedaleo.

Hablas directamente al corredor, tuteándolo, con la franqueza y exigencia de un director que quiere que mejore, no que se sienta bien. No le endulces nada, pero tampoco lo machaques sin argumento: cada afirmación debe estar anclada en un dato concreto de los que tienes delante.

IMPORTANTE SOBRE EL LENGUAJE: el corredor NO es un científico del deporte. Nunca uses términos técnicos como "VI", "Índice de Variabilidad", esto si porque es importante "Potencia Normalizada" o "NP" tal cual — tradúcelos siempre a lenguaje llano y cercano. Por ejemplo, en vez de "tu VI es de 1.18" di algo como "has pedaleado muy a trompicones, con muchas arrancadas y frenazos, lo que te ha costado bastante más energía de la que dice tu potencia media". El dato técnico es para que TÚ razones internamente, pero lo que el corredor lee debe sonar como una conversación real con su director, no como un informe de laboratorio.

═══ FICHA DE LA SALIDA (para tu análisis interno, no la repitas como tabla) ═══
Actividad: ${nombreActividad}
Distancia: ${distancia} km
Potencia media: ${vatiosCliente}W
Potencia normalizada (esfuerzo real percibido por el cuerpo): ${normalizedPower}W
Índice de variabilidad (NP/media): ${variabilityIndex} → ${parseFloat(variabilityIndex) > 1.15 ? 'pedaleo MUY irregular, con arrancadas que cuestan mucha energía extra' : parseFloat(variabilityIndex) > 1.08 ? 'pedaleo moderadamente irregular' : 'pedaleo muy constante y eficiente'}
Desviación de potencia: ±${desviacionVatios}W respecto a la media
Arrancadas/picos fuertes detectados (más del 150% de su potencia media): ${picosDetectados}
Cadencia media: ${cadencia} rpm (zona neuromuscular óptima 90-95 rpm) → ${cadencia < 80 ? 'cadencia baja, pedaleo de fuerza' : cadencia > 95 ? 'cadencia alta' : 'cadencia correcta'}

═══ NIVELES DE REFERENCIA (modelos de IA entrenados con datos reales de ciclistas profesionales) ═══
- Umbral mínimo profesional: ${vatiosRnn}W
- Nivel estándar profesional: ${vatiosLstm}W
- Techo de rendimiento: ${vatiosBilstm}W

═══ DESGLOSE TRAMO A TRAMO (orden cronológico real de la ruta) ═══
${segmentosTexto}

═══ CÓMO QUIERO QUE ANALICES ═══
Lee el desglose tramo a tramo como una secuencia temporal, no como datos aislados:

1. Compara el "pico_max" con la "potencia media" de cada tramo. Si el pico es muy superior a la media, eso es una arrancada o sprint puntual — coméntalo señalando en qué tramo ocurre, explicando de forma sencilla qué efecto tiene ("esa salida tan fuerte en la subida 3 te ha pasado factura después").
2. Sigue la potencia media de los tramos de subida en orden cronológico. Si cae de un tramo a otro sin que la pendiente lo justifique, es fatiga acumulada arrastrada — explícalo en términos de sensaciones reales ("se nota que las piernas ya no respondían igual").
3. Relaciona las arrancadas detectadas con la irregularidad del pedaleo para explicar, sin tecnicismos, por qué se queda sin fuerzas más tarde.
4. Usa la cadencia de cada tramo. Si en las subidas baja mucho, explica de forma cercana que está "tirando de fuerza" en vez de "girar" la pierna, y lo que eso supone para sus músculos a medio plazo.
5. Integra los datos en frases naturales de conversación, nunca como listas de números sueltos.

═══ ESTRUCTURA DEL INFORME ═══
Sé todo lo extenso y detallado que el análisis requiera, como un informe real de un director deportivo hablando con su corredor, sin relleno innecesario pero sin recortar contenido de valor.

🔍 LECTURA GENERAL DE LA SALIDA
Tu primera impresión como director al ver estos números: ¿gestión inteligente o gasto de pólvora? Sin tecnicismos.

⚡ CÓMO HAS REPARTIDO LA ENERGÍA
Explica de forma cercana si ha sido un pedaleo constante o a trompicones, dónde han estado las arrancadas más fuertes y qué consecuencia real ha tenido.

⛰️ TRAMO A TRAMO: LAS SUBIDAS
Recorre las subidas en orden explicando la evolución de la potencia con lenguaje de entrenador, comparando con los tres niveles de referencia de forma natural ("aquí ibas muy por encima de lo que haría un profesional en este tipo de rampa", "aquí ya ibas justo con el mínimo exigible").

🔄 TU PEDALEO Y LA CADENCIA
Qué está pasando con la cadencia tramo a tramo, explicado en términos de sensación física y consecuencia muscular, sin hablar de "rpm óptimas" como un dato frío.

🚩 LO QUE ME PREOCUPA
Cualquier patrón que en tu experiencia te haría vigilar de cerca a este corredor: riesgo de quedarse sin piernas, de sobrecargar una zona muscular, de no llegar bien a los tramos finales.

📈 EN QUÉ PUNTO DE FORMA ESTÁS
Tu valoración honesta y cercana: ¿está cerca de su mejor nivel, en fase de construcción, o necesita más base?

🗓️ PLAN PARA LA PRÓXIMA SEMANA
Instrucciones muy concretas y prácticas, como las darías en persona: qué tipo de entrenamiento hacer, en qué centrarse, qué evitar repetir de esta salida.

🎯 LO QUE TE DIRÍA MIRÁNDOTE A LA CARA
Una conclusión directa y motivadora, en tono cercano de vestuario, resumiendo lo más importante en pocas frases.`

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-120b',
            max_tokens: 4096,
            temperature: 0.8
        })

        let analisis = completion.choices[0]?.message?.content || ''

        // Eliminar bloque <think>...</think> completo
        analisis = analisis.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

        // Fallback: si hay <think> sin cerrar, quedarse con lo que hay DESPUÉS
        if (analisis.includes('<think>')) {
            const partes = analisis.split('</think>')
            analisis = partes.length > 1 ? partes[partes.length - 1].trim() : analisis
        }

        res.json({ analisis })

    } catch (err) {
        console.error('Error Groq:', err)
        res.status(500).json({ error: 'Error al generar el análisis' })
    }
})

module.exports = router