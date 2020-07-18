import { assert, assertEquals, assertThrowsAsync } from "../test_deps.ts";
import { S3Bucket } from "./bucket.ts";
import { S3Error } from "./error.ts";

const bucket = new S3Bucket({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  bucket: "test",
  region: "us-east-1",
  endpointURL: "http://localhost:9000",
});

const encoder = new TextEncoder();
const decoder = new TextDecoder();

Deno.test({
  name: "put object",
  async fn() {
    const resp = await bucket.putObject("test", encoder.encode("Test1"));
    assertEquals(resp.etag, "e1b849f9631ffc1829b2e31402373e3c");
  },
});

Deno.test({
  name: "get object success",
  async fn() {
    const resp = await bucket.getObject("test");
    assert(resp);
    assertEquals(decoder.decode(resp), "Test1");
  },
});

Deno.test({
  name: "get object not found",
  async fn() {
    await assertThrowsAsync(
      () => bucket.getObject("test2"),
      S3Error,
      "404 Not Found",
    );
  },
});

Deno.test({
  name: "delete object",
  async fn() {
    assert(await bucket.getObject("test"));
    assertEquals(
      await bucket.deleteObject("test"),
      { deleteMarker: false, versionID: undefined },
    );
    await assertThrowsAsync(
      () => bucket.getObject("test"),
      S3Error,
      "404 Not Found",
    );
  },
});
