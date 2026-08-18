/**
 * Wrapper for server-function calls.
 *
 * The preview/published host can answer a server-function request with an HTML
 * shell (e.g. a `FORCE_RELOAD` page) while a new build is being swapped in.
 * That HTML then surfaces to the user as a raw markup blob inside a toast.
 * Here we detect it, retry once, and otherwise raise a readable Thai message.
 */

function isHtmlPayload(message: string) {
  return /<html|FORCE_RELOAD|<!doctype/i.test(message);
}

function toMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callServer<TArgs extends { data: unknown }, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  args: TArgs,
): Promise<TResult> {
  try {
    return await fn(args);
  } catch (err) {
    const message = toMessage(err);
    if (!isHtmlPayload(message)) throw new Error(message);

    // Server bundle was mid-refresh — give it a moment and try once more.
    await sleep(1200);
    try {
      return await fn(args);
    } catch (retryErr) {
      const retryMessage = toMessage(retryErr);
      if (isHtmlPayload(retryMessage)) {
        throw new Error("แอปกำลังอัปเดตเวอร์ชันใหม่ กรุณารีเฟรชหน้าแล้วลองอีกครั้ง");
      }
      throw new Error(retryMessage);
    }
  }
}
