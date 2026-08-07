const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000';

export const EDU_LEVELS = ['高中以下', '大學', '碩士以上'] as const;
export const CITIES = ['城市A', '城市B', '城市C'] as const;
export const MODEL_TYPES = ['LinearRegression', 'Lasso', 'Ridge'] as const;

export interface SalaryInput {
  years_experience: number;
  education_level: string;
  city: string;
}

export interface SalaryOutput {
  predicted_salary: number;
  estimated_annual_salary: number;
}

export interface TrainConfig {
  test_size: number;
  random_state: number;
  model_type: string;
  alpha: number;
}

export interface TrainResult {
  status: string;
  r2: number;
  coef: number[];
  intercept: number;
  feature_coefs: Record<string, number>;
  model_type: string;
  alpha: number;
  train_time: number;
  message: string;
}

export async function predictSalary(input: SalaryInput): Promise<SalaryOutput> {
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

export async function trainModel(config: TrainConfig): Promise<TrainResult> {
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
