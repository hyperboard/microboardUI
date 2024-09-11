import { Registry, Histogram, Gauge } from "prom-client";

const register = new Registry();

export const boardEventQueueLatency = new Histogram({
    name: "board_event_queue_latency_nanoseconds",
    help: "Latency of board events from receiving to dequeuing for database write in nanoseconds",
    buckets: [1e4, 5e4, 1e5, 5e5, 1e6, 5e6], // 10μs, 50μs, 100μs, 500μs, 1ms, 5ms
    registers: [register],
});

export const boardEventDbWriteLatency = new Histogram({
    name: "board_event_db_write_latency_nanoseconds",
    help: "Latency of board events from dequeuing to completing database write in nanoseconds",
    buckets: [1e4, 5e4, 1e5, 5e5, 1e6, 5e6], // 10μs, 50μs, 100μs, 500μs, 1ms, 5ms
    registers: [register],
});

export const boardEventTotalLatency = new Histogram({
    name: "board_event_total_latency_nanoseconds",
    help: "Total latency of board events from client to database and back to all clients in nanoseconds",
    buckets: [1e5, 5e5, 1e6, 5e6, 1e7, 5e7], // 100μs, 500μs, 1ms, 5ms, 10ms, 50ms
    registers: [register],
});

export const snapshotSaveLatency = new Histogram({
    name: "snapshot_save_latency_nanoseconds",
    help: "Latency of saving board snapshots to database in nanoseconds",
    buckets: [1e6, 5e6, 1e7, 5e7, 1e8, 5e8], // 1ms, 5ms, 10ms, 50ms, 100ms, 500ms
    registers: [register],
});

export const snapshotReadLatency = new Histogram({
    name: "snapshot_read_latency_nanoseconds",
    help: "Latency of reading board snapshots from database in nanoseconds",
    buckets: [1e6, 5e6, 1e7, 5e7, 1e8, 5e8], // 1ms, 5ms, 10ms, 50ms, 100ms, 500ms
    registers: [register],
});

export const websocketEventQueueSize = new Gauge({
    name: "websocket_event_queue_size",
    help: "Size of the websocket event queue",
    registers: [register],
});

export { register };
