interface QueueTask<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export class RequestQueue {
  private queue: QueueTask<any>[] = [];
  private processing = false;
  private concurrentRequests = 0;
  private maxConcurrent = 5;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ execute: task, resolve, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.concurrentRequests >= this.maxConcurrent) {
      return;
    }

    const task = this.queue.shift();
    if (!task) {
      return;
    }

    this.processing = true;
    this.concurrentRequests++;

    try {
      const result = await task.execute();
      task.resolve(result);
    } catch (error) {
      task.reject(error as Error);
    } finally {
      this.concurrentRequests--;
      this.processing = false;
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }
}