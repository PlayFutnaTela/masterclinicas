import * as pg from "../src/lib/pg";
import { POST } from "../src/app/api/webhooks/n8n/route";

// Mock query implementation
let mockState = {
  nextId: 1000,
};

// Mock pool.connect to provide a fake client used by query()
(pg as any).pool.connect = async () => {
  return {
    query: async (text: string, params?: any[]) => {
      if (text.startsWith("SELECT id FROM organizations")) {
        return { rows: [{ id: params?.[0] }] };
      }
      if (text.includes("FROM users")) {
        return { rows: [{ id: "user-1" }] };
      }
      if (text.startsWith("INSERT INTO leads")) {
        mockState.nextId += 1;
        return { rows: [{ id: `lead-${mockState.nextId}` }] };
      }
      if (text.startsWith("INSERT INTO metric_events")) {
        return { rows: [] };
      }
      if (text.startsWith("INSERT INTO appointments")) {
        mockState.nextId += 1;
        return { rows: [{ id: `appt-${mockState.nextId}` }] };
      }
      return { rows: [] };
    },
    release: () => {},
  };
};

async function run() {
  const fakeRequest = {
    json: async () => ({ type: "new_lead", organizationId: "org-1", data: { name: "Teste", phone: "", procedure: "", source: "n8n" } }),
  } as any;

  const res = await POST(fakeRequest);
  console.log("Result:", res);
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
