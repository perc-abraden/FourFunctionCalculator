import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { NgStyle } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

interface OperationResult {
  operation: string;
  a: number;
  b: number;
  result: number;
}

interface ErrorResponse {
  error: string;
}

interface HealthResponse {
  status: string;
}

type HealthState = 'checking' | 'online' | 'offline';

@Component({
  selector: 'app-root',
  imports: [FormsModule, NgStyle],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  apiBaseUrl = 'http://localhost:5050';
  firstNumber = 10;
  secondNumber = 5;
  selectedOperation: Operation = 'add';

  resultText = '';
  errorText = '';
  isLoading = false;
  healthState: HealthState = 'checking';
  healthText = 'Checking API availability...';
  lastHealthCheckAt: Date | null = null;

  backgroundStartColor = '#f4f7ff';
  backgroundEndColor = '#eefcf6';
  cardColor = '#ffffff';
  primaryButtonColor = '#2563eb';
  cardRadiusPx = 16;

  private readonly healthyPollIntervalMs = 30000;
  private readonly unhealthyPollBaseIntervalMs = 15000;
  private readonly maxPollIntervalMs = 120000;
  private readonly healthRequestTimeoutMs = 3000;

  private healthPollTimer: ReturnType<typeof setTimeout> | null = null;
  private isHealthCheckInFlight = false;
  private currentPollIntervalMs = this.unhealthyPollBaseIntervalMs;
  private readonly visibilityChangeHandler = () => this.handleVisibilityChange();

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    this.scheduleNextHealthCheck(0);
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    this.clearHealthPollTimer();
  }

  checkApiHealth(): void {
    this.currentPollIntervalMs = this.unhealthyPollBaseIntervalMs;
    this.performHealthCheck();
  }

  private performHealthCheck(): void {
    if (document.visibilityState === 'hidden') {
      return;
    }

    if (this.isHealthCheckInFlight) {
      return;
    }

    this.isHealthCheckInFlight = true;
    this.healthState = 'checking';
    this.healthText = 'Checking API availability...';

    this.http.get<HealthResponse>(`${this.apiBaseUrl}/health`).pipe(
      timeout(this.healthRequestTimeoutMs),
      finalize(() => {
        this.lastHealthCheckAt = new Date();
        this.isHealthCheckInFlight = false;
        this.scheduleNextHealthCheck(this.currentPollIntervalMs);
      })
    ).subscribe({
      next: (response) => {
        if (response.status !== 'ok') {
          this.healthState = 'offline';
          this.healthText = 'API health check returned an unexpected response';
          this.currentPollIntervalMs = Math.min(this.currentPollIntervalMs * 2, this.maxPollIntervalMs);
          return;
        }

        this.healthState = 'online';
        this.healthText = 'API is online';
        this.currentPollIntervalMs = this.healthyPollIntervalMs;
      },
      error: () => {
        this.healthState = 'offline';
        this.healthText = 'API is offline or unreachable';
        this.currentPollIntervalMs = Math.min(this.currentPollIntervalMs * 2, this.maxPollIntervalMs);
      }
    });
  }

  get lastHealthCheckText(): string {
    if (!this.lastHealthCheckAt) {
      return 'Never';
    }

    return this.lastHealthCheckAt.toLocaleTimeString();
  }

  get themeStyleVars(): Record<string, string> {
    return {
      '--bg-start': this.backgroundStartColor,
      '--bg-end': this.backgroundEndColor,
      '--card-bg': this.cardColor,
      '--primary-color': this.primaryButtonColor,
      '--card-radius': `${this.cardRadiusPx}px`
    };
  }

  resetTheme(): void {
    this.backgroundStartColor = '#f4f7ff';
    this.backgroundEndColor = '#eefcf6';
    this.cardColor = '#ffffff';
    this.primaryButtonColor = '#2563eb';
    this.cardRadiusPx = 16;
  }

  private scheduleNextHealthCheck(delayMs: number): void {
    this.clearHealthPollTimer();
    this.healthPollTimer = setTimeout(() => this.performHealthCheck(), delayMs);
  }

  private clearHealthPollTimer(): void {
    if (this.healthPollTimer) {
      clearTimeout(this.healthPollTimer);
      this.healthPollTimer = null;
    }
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      this.clearHealthPollTimer();
      return;
    }

    this.scheduleNextHealthCheck(0);
  }

  calculate(): void {
    this.errorText = '';
    this.resultText = '';
    this.isLoading = true;

    const params = new HttpParams()
      .set('a', this.firstNumber)
      .set('b', this.secondNumber);

    const url = `${this.apiBaseUrl}/api/calculator/${this.selectedOperation}`;

    this.http.get<OperationResult>(url, { params }).subscribe({
      next: (response) => {
        this.resultText = `Result: ${response.result}`;
        this.healthState = 'online';
        this.healthText = 'API is online';
        this.currentPollIntervalMs = this.healthyPollIntervalMs;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        const backendError = error.error as ErrorResponse | null;
        this.errorText = backendError?.error ?? 'Unable to complete calculation.';
        if (error.status === 0) {
          this.healthState = 'offline';
          this.healthText = 'API is offline or unreachable';
          this.currentPollIntervalMs = Math.min(this.currentPollIntervalMs * 2, this.maxPollIntervalMs);
          this.errorText = 'Cannot reach API. Make sure backend is running on http://localhost:5050.';
        }
        this.isLoading = false;
      }
    });
  }
}
