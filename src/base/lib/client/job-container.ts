import { type CronJob } from 'cron'

export class EtyClientJobContainer {
  private readonly jobs = new Map<string, CronJob>()

  addJob(id: string, job: CronJob): void {
    this.jobs.set(id, job)
  }
}
