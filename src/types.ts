type Hotel = 'vigo' | 'coruna';

type DistanceEntry = {
  vigo: number; // distancia en minutos desde Meliá Vigo
  coruna: number; // distancia en minutos desde Meliá María Pita
  penalty: Record<Hotel, number>; // penalización en puntuación
  zone: 'vigo' | 'coruna';
  name: string;
  defaultValue: number;
  custom: boolean;
};

type DistanceData = Record<string, DistanceEntry>;

type GroupedData = Record<
  'vigo' | 'coruna',
  {
    zone: 'vigo' | 'coruna';
    entries: { id: string; data: DistanceEntry }[];
  }
>;

type Place = {
  id: string
  name: string
  vigoScore: number
  corunaScore: number
  weight: number
}