import { type TrainResult } from './api';

const STORAGE_KEY = 'salary_last_train_result';

export function saveLastTrainResult(result: TrainResult) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // ignore storage errors
  }
}

export function loadLastTrainResult(): TrainResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrainResult) : null;
  } catch {
    return null;
  }
}
