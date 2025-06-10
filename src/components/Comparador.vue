<template>
    <div class="container">
        <h1>🏨 Comparador de Hoteles - Galicia</h1>

        <div class="hotels-section">
            <div class="hotel-cards">
                <div class="hotel-card">
                    <h3>🏨 Meliá Vigo</h3>
                    <div class="hotel-info">
                        <strong>Ubicación:</strong> Centro de Vigo<br>
                        <strong>Zona:</strong> Ría de Vigo<br>
                        <strong>Ventajas:</strong> Cerca del centro histórico, puerto, restaurantes
                    </div>
                </div>
                <div class="hotel-card">
                    <h3>🏨 Meliá María Pita</h3>
                    <div class="hotel-info">
                        <strong>Ubicación:</strong> Centro de A Coruña<br>
                        <strong>Zona:</strong> Norte de Galicia<br>
                        <strong>Ventajas:</strong> Frente al mar, cerca de la Torre de Hércules
                    </div>
                </div>
            </div>
        </div>

        <div class="add-place-section">
            <h3>➕ Añadir Nuevo Lugar de Interés</h3>
            <p>Completa los datos del lugar que quieres visitar:</p>

            {{ formAlert }}

            <div class="form-grid">
                <div class="form-group">
                    <label for="place-name-input">🏷️ Nombre del Lugar</label>
                    <input type="text" id="place-name-input" placeholder="ej: Rías Baixas, Santiago..."
                        v-model="placeName" />
                </div>

                <div class="form-group">
                    <label for="place-zone">🗺️ Zona</label>
                    <select id="place-zone" v-model="placeZone">
                        <option value="vigo">🌊 Ría de Vigo</option>
                        <option value="coruna">🏔️ Norte de Galicia</option>
                        <option value="custom">📍 Otra zona</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="distance-vigo">🚗 Distancia desde Vigo (min)</label>
                    <input type="number" id="distance-vigo" placeholder="60" min="0" max="300"
                        v-model.number="distanceVigo" />
                </div>

                <div class="form-group">
                    <label for="distance-coruna">🚗 Distancia desde A Coruña (min)</label>
                    <input type="number" id="distance-coruna" placeholder="90" min="0" max="300"
                        v-model.number="distanceCoruna" />
                </div>

                <div class="form-group">
                    <button class="add-button" @click.prevent="addNewPlace">
                        ➕ Añadir
                    </button>
                </div>
            </div>

            <div
                style="margin-top: 15px; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 8px; font-size: 13px; color: #495057;">
                💡 <strong>Tip:</strong> Las distancias en minutos las puedes consultar en Google Maps. El sistema
                calculará automáticamente los factores de penalización según la distancia.
            </div>
        </div>

        <div class="comparison-table">
            <table>
                <thead>
                    <tr>
                        <th style="width: 30%">Lugar de Interés</th>
                        <th style="width: 15%">Distancia desde Meliá Vigo</th>
                        <th style="width: 15%">Distancia desde Meliá María Pita</th>
                        <th style="width: 15%">Hotel más cercano</th>
                        <th style="width: 25%">Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="group in ['vigo', 'coruna']" :key="group">
                        <tr>
                            <td class="zona-header" colspan="5">
                                {{ group === 'vigo' ? '🌊 RÍA DE VIGO' : '🏔️ NORTE DE GALICIA - A CORUÑA' }}
                            </td>
                        </tr>
                        <tr v-for="entry in groupedData[group].entries" :key="entry.id">
                            <td><strong>{{ entry.data.name }}</strong></td>
                            <td :class="getDistanceClass(entry.data.vigo, entry.data.coruna, 'vigo')">
                                {{ formatTime(entry.data.vigo) }}
                            </td>
                            <td :class="getDistanceClass(entry.data.vigo, entry.data.coruna, 'coruna')">
                                {{ formatTime(entry.data.coruna) }}
                            </td>
                            <td><strong>{{ getClosestHotel(entry.data) }}</strong></td>
                            <td>{{ descriptions[entry.id] || '—' }}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <div class="scoring-section">
            <h2>📊 Calculadora de Puntuación</h2>
            <p>
                Asigna la importancia de cada lugar (0-10 puntos). El cálculo se hace
                automáticamente:
            </p>

            <div class="calculator-section">
                <div
                    style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 15px; margin-bottom: 15px; font-weight: bold; color: #2c3e50;">
                    <div>Lugar de Interés</div>
                    <div style="text-align: center;">Importancia</div>
                    <div style="text-align: center;">Puntos Vigo</div>
                    <div style="text-align: center;">Puntos A Coruña</div>
                    <div style="text-align: center;">Acciones</div>
                </div>

                <div v-for="group in ['vigo', 'coruna']" :key="group">
                    <div
                        style="background: linear-gradient(135deg, #6f42c1, #e83e8c); color: white; padding: 10px; margin: 10px 0; border-radius: 8px; text-align: center; font-weight: bold;">
                        {{ zoneLabels[group] }}
                    </div>
                    <div v-for="entry in groupedData[group].entries" :key="entry.id"
                        style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 15px; margin-bottom: 10px; padding: 10px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px;">
                        <div style="font-weight: bold;">{{ entry.data.name }}</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input class="importance-slider" type="range" min="0" max="10"
                                v-model.number="entry.data.defaultValue" @change="updateCalculation" />
                            <span class="slider-value">{{ entry.data.defaultValue }}</span>
                        </div>
                        <div class="distance-display" style="text-align: center;">{{ entry.data.vigo }} pts</div>
                        <div class="distance-display" style="text-align: center;">{{ entry.data.coruna }} pts</div>
                        <button class="delete-button" @click="deletePlace(entry.id)">X</button>
                    </div>
                </div>

                <button class="reset-button" @click="resetValues">🔄 Restaurar Valores por Defecto</button>
            </div>

            <div class="scoring-grid">
                <div class="scoring-card">
                    <h3>🏨 Meliá Vigo (Ría de Vigo)</h3>
                    <ul>
                        <li><strong>Ventajas:</strong> Islas Cíes únicamente desde aquí, centro histórico vibrante,
                            gastronomía
                            marinera auténtica</li>
                        <li><strong>Ideal para:</strong> Amantes del mar, gastronomía, ambiente portuario</li>
                        <li><strong>Lugares únicos:</strong> Islas Cíes (30min vs 2h30min)</li>
                    </ul>
                    <div class="total-score">
                        Puntuación: {{ totalVigoScore }}
                    </div>
                </div>

                <div class="scoring-card">
                    <h3>🏨 Meliá María Pita (A Coruña)</h3>
                    <ul>
                        <li><strong>Ventajas:</strong> Torre de Hércules (UNESCO), más cerca de Playa Catedrales,
                            Finisterre
                        </li>
                        <li><strong>Ideal para:</strong> Historia, paisajes dramáticos, puestas de sol</li>
                        <li><strong>Lugares únicos:</strong> Torre de Hércules, mejor acceso al norte</li>
                    </ul>
                    <div class="total-score">
                        Puntuación: {{ totalCorunaScore }}
                    </div>
                </div>
            </div>

            <div class="calculation-summary">
                <h3>📊 Análisis de Resultados</h3>
                <div>
                    <p v-for="place in scoredPlaces" :key="place.id">
                        {{ place.name }} → {{ place.weight }} puntos asignados
                    </p>
                </div>
                <div class="recommendation-box">
                    {{ recommendation }}
                </div>
            </div>
        </div>

        <div class="legend">
            <h4>📍 Leyenda de Distancias</h4>
            <span class="legend-item distancia-cercana">Menos de 30 min</span>
            <span class="legend-item distancia-media">30 min - 1h 30min</span>
            <span class="legend-item distancia-lejana">Más de 1h 30min</span>

            <h4 style="margin-top: 20px;">💡 Recomendación</h4>
            <p><strong>Opción A:</strong> 2 noches en Meliá María Pita + 1 noche en Meliá Vigo<br>
                <em>Ideal si priorizáis Playa de las Catedrales, Torre de Hércules y Finisterre</em>
            </p>

            <p><strong>Opción B:</strong> 2 noches en Meliá Vigo + 1 noche en Meliá María Pita<br>
                <em>Ideal si priorizáis las Islas Cíes y la auténtica experiencia marinera gallega</em>
            </p>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import type { DistanceData, Place, GroupedData } from '../types.ts';

const defaultDistanceData: DistanceData = {
    'islas-cies': { vigo: 30, coruna: 150, penalty: { vigo: 1, coruna: 5 }, zone: 'vigo', name: '🏖️ Islas Cíes', defaultValue: 8, custom: false },
    'centro-vigo': { vigo: 5, coruna: 90, penalty: { vigo: 1, coruna: 18 }, zone: 'vigo', name: '🏛️ Centro Histórico Vigo', defaultValue: 6, custom: false },
    'puerto-vigo': { vigo: 10, coruna: 90, penalty: { vigo: 1, coruna: 9 }, zone: 'vigo', name: '🦪 Puerto Vigo', defaultValue: 5, custom: false },
    'samil': { vigo: 15, coruna: 105, penalty: { vigo: 1, coruna: 7 }, zone: 'vigo', name: '🏖️ Playa de Samil', defaultValue: 4, custom: false },
    'baiona': { vigo: 30, coruna: 120, penalty: { vigo: 1, coruna: 4 }, zone: 'vigo', name: '🏰 Baiona', defaultValue: 6, custom: false },
    'torre-hercules': { vigo: 90, coruna: 10, penalty: { vigo: 9, coruna: 1 }, zone: 'coruna', name: '🗼 Torre de Hércules', defaultValue: 9, custom: false },
    'catedrales': { vigo: 150, coruna: 75, penalty: { vigo: 2, coruna: 1 }, zone: 'coruna', name: '🏖️ Playa de las Catedrales', defaultValue: 10, custom: false },
    'arousa': { vigo: 75, coruna: 90, penalty: { vigo: 1, coruna: 1.2 }, zone: 'vigo', name: '🏝️ Illa de Arousa', defaultValue: 5, custom: false },
    'centro-coruna': { vigo: 90, coruna: 5, penalty: { vigo: 18, coruna: 1 }, zone: 'coruna', name: '🏛️ Centro A Coruña', defaultValue: 6, custom: false },
    'orzan': { vigo: 90, coruna: 15, penalty: { vigo: 6, coruna: 1 }, zone: 'coruna', name: '🏖️ Playa Orzán y Riazor', defaultValue: 4, custom: false },
    'san-anton': { vigo: 90, coruna: 15, penalty: { vigo: 6, coruna: 1 }, zone: 'coruna', name: '🏰 Castillo de San Antón', defaultValue: 5, custom: false },
    'finisterre': { vigo: 120, coruna: 90, penalty: { vigo: 1.33, coruna: 1 }, zone: 'coruna', name: '🌊 Cabo Finisterre', defaultValue: 8, custom: false },
    'betanzos': { vigo: 105, coruna: 30, penalty: { vigo: 3.5, coruna: 1 }, zone: 'coruna', name: '🏘️ Betanzos', defaultValue: 4, custom: false }
}

const distanceData = ref<DistanceData>(structuredClone(defaultDistanceData))

const descriptions = {
    'islas-cies': 'Paraíso natural, Parque Nacional, playas vírgenes',
    'centro-vigo': 'Casco antiguo, mercado, vida nocturna',
    'puerto-vigo': 'Puerto pesquero, marisquerías, ambiente marinero',
    'samil': 'Playa urbana más grande de Vigo',
    'baiona': 'Villa histórica, fortaleza, puerto deportivo',
    'torre-hercules': 'Faro romano más antiguo del mundo, Patrimonio UNESCO',
    'catedrales': 'Formaciones rocosas espectaculares (¡IMPRESCINDIBLE!)',
    'arousa': 'Isla conectada por puente, playas tranquilas',
    'centro-coruna': 'Galerías acristaladas, Plaza María Pita, ambiente urbano',
    'orzan': 'Playas urbanas de A Coruña, paseo marítimo',
    'san-anton': 'Fortaleza histórica, museo arqueológico',
    'finisterre': '"Fin del mundo", puestas de sol espectaculares',
    'betanzos': 'Villa medieval, iglesias góticas, tortilla de Betanzos'
}

const defaultPlaces: Place[] = [
    {
        id: 'cies',
        name: 'Islas Cíes',
        vigoScore: 10,
        corunaScore: 3,
        weight: 5,
    },
    {
        id: 'torre',
        name: 'Torre de Hércules',
        vigoScore: 4,
        corunaScore: 9,
        weight: 5,
    },
]

const scoredPlaces = ref<Place[]>([...defaultPlaces])

const zoneLabels = {
    vigo: '🌊 RÍA DE VIGO',
    coruna: '🏔️ NORTE DE GALICIA - A CORUÑA',
    custom: '📍 OTROS LUGARES'
}

const customPlaceCounter = ref(0);
const formAlert = ref('');
const placeName = ref('')
const placeZone = ref('vigo')
const distanceVigo = ref<number | null>(null)
const distanceCoruna = ref<number | null>(null)

const saved = localStorage.getItem('distanceData')
if (saved) {
    try {
        distanceData.value = JSON.parse(saved)
    } catch {
        distanceData.value = structuredClone(defaultDistanceData)
    }
} else {
    distanceData.value = structuredClone(defaultDistanceData)
}

watch(distanceData, (newVal) => {
    localStorage.setItem('distanceData', JSON.stringify(newVal))
}, { deep: true })

const calculatePenalty = (distance: number) => {
  const baseDistance = 30;
  const growthRate = 0.03;
  if (distance <= baseDistance) return 1;
  return 1 + Math.exp(growthRate * (distance - baseDistance)) - 1;
}

const generatePlaceId = (name: string) => name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + (++customPlaceCounter.value);

const addNewPlace = () => {
    const key = generatePlaceId(placeName.value);

    if (!key) {
        alert('El nombre del lugar no puede estar vacío')
        return
    }
    if (distanceData.value[key]) {
        alert('Ya existe un lugar con ese nombre')
        return
    }
    if (
        distanceVigo.value == null ||
        distanceCoruna.value == null ||
        isNaN(Number(distanceVigo.value)) ||
        isNaN(Number(distanceCoruna.value)) ||
        placeZone.value !== 'vigo' && placeZone.value !== 'coruna'
    ) {
        alert('Introduce valores válidos para distancias y zona')
        return
    }

    distanceData.value = {
        ...distanceData.value,
        [key]: {
            vigo: Number(distanceVigo.value),
            coruna: Number(distanceCoruna.value),
            penalty: { vigo: calculatePenalty(distanceVigo.value), coruna: calculatePenalty(distanceCoruna.value) },
            zone: placeZone.value as 'vigo' | 'coruna',
            name: placeName.value,
            defaultValue: 5,
            custom: true
        }
    }

    placeName.value = ''
    placeZone.value = 'vigo'
    distanceVigo.value = 0
    distanceCoruna.value = 0
}

const updateCalculation = () => {
    scoredPlaces.value = Object.entries(distanceData.value).map(([id, data]) => {
        const importance = data.defaultValue || 0;
        
        const vigoScore = Math.round(importance * data.penalty.vigo);
        const corunaScore = Math.round(importance * data.penalty.coruna);

        return {
            id,
            name: data.name,
            vigoScore,
            corunaScore,
            weight: importance
        };
    });
};

const showAlert = (message: string, type: 'success' | 'error') => {
    formAlert.value = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        formAlert.value = '';
    }, 5000);
}

const deletePlace = (key: string) => {
    delete distanceData.value[key]
    updateCalculation()
}

const groupedData = computed<GroupedData>(() => {
    const result: GroupedData = {
        vigo: { zone: 'vigo', entries: [] },
        coruna: { zone: 'coruna', entries: [] }
    };

    for (const [id, data] of Object.entries(distanceData.value)) {
        result[data.zone].entries.push({ id, data });
    }

    return result;
});

const resetValues = () => {
    distanceData.value = updatePenalties(distanceData.value);
    updateCalculation()
}

const totalVigoScore = computed(() =>
    scoredPlaces.value.reduce((total, place) => total + place.vigoScore * place.weight, 0)
)

const totalCorunaScore = computed(() =>
    scoredPlaces.value.reduce((total, place) => total + place.corunaScore * place.weight, 0)
)

const recommendation = computed(() => {
    if (totalVigoScore.value < totalCorunaScore.value) {
        return '🏨 ¡Parece que quedarse dos noches en Vigo es la mejor opción!'
    } else if (totalCorunaScore.value < totalVigoScore.value) {
        return '🏨 ¡A Coruña se adapta mejor a tus intereses, te recomiendo que te quedes dos noches en el Melià Maria Pita!'
    } else {
        return '⚖️ Ambos destinos tienen puntuación igual. ¡Difícil elección! ¿Lanzamos una moneda?'
    }
})

const getDistanceClass = (vigoTime, corunaTime, hotel) => {
    const isClosest = hotel === 'vigo' ? vigoTime < corunaTime : corunaTime < vigoTime
    if (!isClosest) return 'distancia-lejana'
    const time = hotel === 'vigo' ? vigoTime : corunaTime
    if (time <= 30) return 'distancia-cercana'
    if (time <= 90) return 'distancia-media'
    return 'distancia-lejana'
}

const getClosestHotel = (item) => {
    return item.vigo <= item.coruna ? 'Meliá Vigo' : 'Meliá María Pita'
}

const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h${m > 0 ? ` ${m}min` : ''}`
}

const updatePenalties = (data: DistanceData): DistanceData => {
  const updatedData: DistanceData = {};

  for (const [key, place] of Object.entries(data)) {
    updatedData[key] = {
      ...place,
      penalty: {
        vigo: calculatePenalty(place.vigo),
        coruna: calculatePenalty(place.coruna)
      }
    };
  }

  return updatedData;
};

onMounted(() => {
    resetValues()
})
</script>

<style scoped>
.comparison-table {
    margin-top: 2rem;
}

.zona-header {
    font-weight: bold;
    background-color: #f3f4f6;
}

.distancia-cercana {
    color: green;
}

.distancia-media {
    color: orange;
}

.distancia-lejana {
    color: red;
}
</style>