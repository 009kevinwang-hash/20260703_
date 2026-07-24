const API_BASE = 'https://two0260703.onrender.com';

export interface IrisInput {
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
}

export interface IrisOutput {
  prediction_id: number;
  prediction_label: string;
  probabilities: Record<string, number>;
}

export interface TrainConfig {
  n_estimators: number;
  max_depth: number | null;
  test_size: number;
  random_state: number;
}

export interface TrainResult {
  status: string;
  accuracy: number;
  train_time: number;
  feature_importances: Record<string, number>;
  message: string;
}

export async function predict(input: IrisInput): Promise<IrisOutput> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '預測請求失敗' }));
    throw new Error(err.detail || '預測請求失敗');
  }
  return res.json();
}

export async function train(config: TrainConfig): Promise<TrainResult> {
  const res = await fetch(`${API_BASE}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '訓練請求失敗' }));
    throw new Error(err.detail || '訓練請求失敗');
  }
  return res.json();
}
